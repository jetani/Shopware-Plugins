<?php

/**
 * Shopware Backend Controller
 */
use Doctrine\ORM\Query\Expr;
class Shopware_Controllers_Backend_BestellungenNeuLager extends Shopware_Controllers_Backend_ExtJs
{
    public function getLagerOrdersListAction(){

        $limit = $this->Request()->getParam('limit', 20);
        $offset = $this->Request()->getParam('start', 0);
        $filter = $this->Request()->getParam('filter', null);
        $sort = $this->Request()->getParam('sort', null);

        if (empty($sort)) {
            $sort = array(array('property' => 'dispatch.name', 'direction' => 'ASC'),array('property' => 'orders.id', 'direction' => 'ASC'));//,array('property' => 'orders.id', 'direction' => 'DES')
        } else {
            $sort[0]['property'] = 'orders.' . $sort[0]['property'];
        }

        $query = $this->getOrdersQuery($sort, $offset, $limit, $filter);
        $query->setHydrationMode(\Doctrine\ORM\AbstractQuery::HYDRATE_ARRAY);
        $paginator = $this->getModelManager()->createPaginator($query);
        $total = $paginator->count();

        $data = $query->getArrayResult();

        $lock = 1;
        if(Shopware()->Plugins()->Backend()->BestellungenNeuLager()->Config()->unLock24hourPrint)
        {
            $lock = 0;
        }

        $ordersWithNotXXL = array();
        $countOrderXXL = 0;

        foreach ($data as &$item) {
            // check for XXL
            $item['XXL'] = 0;
            $item['notXXL'] = 0;
            $item['bearbeiter'] = "";
            $item = $this->checkXXL($item);

            if($item['XXL']){
                $countOrderXXL = $countOrderXXL + 1;
            }

            if($item['notXXL']){

                //file_put_contents(__DIR__."/log.txt", "order Detail: ". print_r($item['details'], true)."\r\n" , FILE_APPEND);
                $item['customerEmail'] = $item['customer']['email'];

                if($item['id'])
                {
                    $getInvoiceNumber = Shopware()->Db()->fetchOne("SELECT docID FROM `s_order_documents` WHERE `type` = ? AND `orderID` = ?", array('1',$item['id']));

                    if($getInvoiceNumber){
                        $item['invoiceNumber'] = $getInvoiceNumber;
                    }else{
                        $item['invoiceNumber'] = '';
                    }

                    // assign proper shipping method according to package available. If atleast one pachage from DHL than assign shipping methos as DHL otherwise DPD
                    $hasDHLShipping = Shopware()->Db()->fetchOne("SELECT id FROM `s_order_viison_intraship` WHERE `orderID` = ?", array($item['id']));
                    if($hasDHLShipping){
                        $dispatchMethodName = "DHL Versand ".$item['shipping']['country']['iso'];
                    }else{
                        $dispatchMethodName = "DPD Versand ".$item['shipping']['country']['iso'];
                    }

                    $item['dispatch']['name'] = $dispatchMethodName;


                    // chekck if order is already printed in lager
                    $item['isAlreadyPrinted'] = 0;

                    $orderAttribute = Shopware()->Models()->getRepository('Shopware\Models\Attribute\Order')->findOneBy(Array(
                        'orderId' => $item['id']
                    ));

                    if($orderAttribute instanceof Shopware\Models\Attribute\Order){
                        $processedDate = $orderAttribute->getBestellungenNeuLagerProcessDate();
                        if($processedDate){
                            $item['isAlreadyPrinted'] = 1;
                            $item['bearbeiter'] = $orderAttribute->getBestellungenNeuLagerUser();
                        }
                    }
                }

                $item['lock'] = $lock;
                $ordersWithNotXXL[] = $item;
            }
        }

        require_once(__DIR__."/../../../../../Community/Backend/RedMagnalister/Lib/Core/ML.php");
        if(ML::isInstalled()){
            ML::setFastLoad(true);
            foreach ($ordersWithNotXXL as &$aRow) {
                $isMarketOrder = Shopware()->Db()->fetchOne("SELECT count(*) AS `count` FROM `magnalister_orders` WHERE `current_orders_id` = ? ", array($aRow['id']));
                if($isMarketOrder)
                {
                    $oOrder = MLOrder::factory()->set('current_orders_id',$aRow['id']);
                    $sLogo = $oOrder->getLogo();
                    $aRow['magnalisterlogo'] = $sLogo == ''? '' :'<img src="'.$sLogo.'" />';
                }
                //$aRow['countXXL'] = $countOrderXXL;
            }
        }

        // sends the out put to the view
        $this->View()->assign(array(
            'success' => true,
            'data'    => $ordersWithNotXXL,
            'countXXL'    => $countOrderXXL,
            'total'   => count($ordersWithNotXXL)
        ));

    }

    public function getOrdersQuery($sort, $offset, $limit, $filter){

        $tmp = new Zend_Date();

        $builder = Shopware()->Models()->createQueryBuilder();
        $builder->select(array(
            'orders',
            'details',
            'customer',
            'billing',
            'billingCountry',
            'shipping',
            'shippingCountry',
            'dispatch',
            'orderStatus'
        ));
        $builder->from('Shopware\Models\Order\Order', 'orders');
        $builder->leftJoin('orders.customer', 'customer')
            ->leftJoin('orders.details', 'details')
            ->leftJoin('orders.billing', 'billing')
            ->leftJoin('billing.country', 'billingCountry')
            ->leftJoin('orders.shipping', 'shipping')
            ->leftJoin('shipping.country', 'shippingCountry')
            ->leftJoin('orders.dispatch', 'dispatch')
            ->leftJoin('orders.orderStatus', 'orderStatus')
            ->where('orderStatus = 1')
            ->andWhere('orders.orderTime <= :orderTimeTo')
            ->setParameter('orderTimeTo', $tmp->get('yyyy-MM-dd')." 12:00:00")
            ->addOrderBy($sort)
            /*->setFirstResult($offset)
            ->setMaxResults($limit)*/;

        if (!empty($filter)) {
            $builder = $this->filterListQuery($builder, $filter);
        }
        $builder->andWhere($builder->expr()->notIn('orders.status', array('-1')));
        $builder->andWhere('orders.number IS NOT NULL');

        $query = $builder->getQuery();
        return $query;
    }

    public function checkXXL($order){

        $articleAttributeRepo = Shopware()->Models()->getRepository('Shopware\Models\Attribute\Article');

        $cXXL = 0;
        $cNotXXL = 0;
        $cXXLStatus = 0;
        $cNotXXLStatus = 0;

        foreach ($order['details'] as $key => &$orderDetail){

            if($orderDetail['articleId']){

                // if articleId and articleDetailId is available than check if article contains XXL image
                $checkXXLIImage = $articleAttributeRepo->findOneBy(array('articleId' => $orderDetail['articleId']));
                if($checkXXLIImage instanceof Shopware\Models\Attribute\Article){

                    if(strpos($orderDetail['articleNumber'], 'rabatt') == false){
                        if (strpos($checkXXLIImage->getSwagAttr31(), 'Eager Art') !== false) {
                            $cXXL = $cXXL + 1;
                            if($orderDetail['statusId'] != 4)
                                $cXXLStatus = $cXXLStatus + 1;
                        }else{
                            $cNotXXL = $cNotXXL + 1;
                            if($orderDetail['statusId'] != 4)
                                $cNotXXLStatus = $cNotXXLStatus + 1;
                        }
                    }
                    file_put_contents(__DIR__."/log.txt", $order['number']." : ".$orderDetail['articleNumber']." has attribute31 ".$checkXXLIImage->getSwagAttr31()."\r\n"  , FILE_APPEND);
                }else{
                    file_put_contents(__DIR__."/log.txt", "articleAttribute not found for article: ". $orderDetail['articleNumber']."\r\n" , FILE_APPEND);
                }

            }else{
                file_put_contents(__DIR__."/log.txt", "articleDetail Model not found for OrderID: ". $order['id']."\r\n" , FILE_APPEND);
            }
        }

        if($cXXL > 0 && $cXXLStatus>0){
            $order['XXL'] = 1;
        }elseif ($cNotXXL > 0 && $cNotXXLStatus>0){
            $order['notXXL'] = 1;
        }

        return $order;
    }

    protected function filterListQuery(\Doctrine\ORM\QueryBuilder $builder, $filters=null)
    {
        $expr = Shopware()->Models()->getExpressionBuilder();

        if (!empty($filters)) {
            foreach ($filters as $filter) {
                if (empty($filter['property']) || $filter['value'] === null || $filter['value'] === '') {
                    continue;
                }
                switch ($filter['property']) {
                    case "free":
                        $builder->andWhere(
                            $expr->orX(
                                $expr->like('orders.number', '?1'),
                                $expr->like('orders.invoiceAmount', '?1'),
                                $expr->like('orders.transactionId', '?1'),
                                $expr->like('billing.company', '?3'),
                                $expr->like('customer.email', '?3'),
                                $expr->like('billing.lastName', '?3'),
                                $expr->like('billing.firstName', '?3'),
                                $expr->like('orders.comment', '?3'),
                                $expr->like('orders.customerComment', '?3'),
                                $expr->like('orders.internalComment', '?3'),
                                $expr->like('dispatch.name', '?3')
                            )
                        );
                        $builder->setParameter(1,       $filter['value'] . '%');
                        $builder->setParameter(3, '%' . $filter['value'] . '%');
                        break;

                    default:
                        $builder->andWhere($expr->eq($filter['property'], $filter['value']));
                }
            }
        }
        return $builder;
    }
    
    public function getOrderStateCommiAction() {
    
    	$orderId = $this->Request()->getParam("orderId");
    
    	$sql = "SELECT * FROM s_order WHERE id='".$orderId."'";
    
    	$orderInfo = Shopware()->Db()->fetchRow($sql, array());

        $userAtPacktish1 = Shopware()->Plugins()->Backend()->BestellungenNeuLager()->Config()->userAtPacktisch1;

        // get username and roleID of the person who presses the button
        if (is_object($_SESSION['Shopware']['Auth'])) {
            $roleID = $_SESSION['Shopware']['Auth']->roleID;
        } else {
            $roleID = null;
        }

    	if($orderInfo["status"] == "1") {
    		$this->View()->assign(
    				array(
    						'success' => true,
                            'roleID' => $roleID,
                            'user1' => $userAtPacktish1
    				)
    				);
    	} else {
    		$this->View()->assign(
    				array(
    						'success' => false,
    						'test' => print_r($orderInfo, true)
    				)
    				);
    	}
    }

    public function unlockOrderAction(){

        $orderId = $this->Request()->getParam("orderId");

        $orderAttribute = Shopware()->Models()->getRepository('Shopware\Models\Attribute\Order')->findOneBy(Array(
            'orderId' => $orderId
        ));

        if($orderAttribute instanceof Shopware\Models\Attribute\Order){
            $this->updateNeuLagerProcess($orderAttribute, "", "");
            $success = true;
        }else{
            $success = false;
            file_put_contents(__DIR__."/log.txt", "OrderAttribute not found: ". $orderId."\r\n" , FILE_APPEND);
        }

        $this->View()->assign(
            array(
                'success' => $success
            )
        );
    }

    public function updateNeuLagerProcess($orderAttribute, $processDate, $username){

        $orderAttribute->setBestellungenNeuLagerProcessDate($processDate);
        $orderAttribute->setBestellungenNeuLagerUser($username);
        Shopware()->Models()->persist($orderAttribute);
        Shopware()->Models()->flush();
    }
}