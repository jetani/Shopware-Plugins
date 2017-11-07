<?php

/**
 * Shopware Backend Controller
 */
use Shopware\CustomModels\Position\History as positionHistory,
    Doctrine\ORM\Query\Expr;
class Shopware_Controllers_Backend_PositionStatusHistory extends Shopware_Controllers_Backend_Application
{
    protected $model = 'Shopware\CustomModels\Position\History';
    protected $alias = 'positionHistory';

    /**
     * Load list of Position status history
     */
    public function listAction(){

        $orderId = $this->Request()->getParam('orderId');

        $limit = $this->Request()->getParam('limit', 30);
        $offset = $this->Request()->getParam('start', 0);
        $sort = $this->Request()->getParam('sort', null);

        if (empty($sort)) {
            $sort = array(array('property' => 'positionHistory.positionId', 'direction' => 'DESC'),array('property' => 'positionHistory.id', 'direction' => 'DESC'));
        } else {
            $sort[0]['property'] = 'positionHistory.' . $sort[0]['property'];
        }
        $builder = Shopware()->Models()->createQueryBuilder();
        $builder->select('positionHistory','position','previousStatus','currentStatus','user')
            ->from('Shopware\CustomModels\Position\History', 'positionHistory')
            ->leftJoin('positionHistory.position','position')
            ->leftJoin('positionHistory.previousPositionStatus','previousStatus')
            ->leftJoin('positionHistory.positionStatus','currentStatus')
            ->leftJoin('positionHistory.user','user')
            ->where('positionHistory.orderId = '.$orderId)
            ->addOrderBy($sort)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        $query = $builder->getQuery();
        $data = $query->getArrayResult();

        foreach($data as &$history){
            $history['userName'] = $history['user']['name'];
            $history['articleNumber'] = $history['position']['articleNumber'];
            $history['prevPositionStatus'] = $history['previousPositionStatus']['description'];
            $history['currentPositionStatus'] = $history['positionStatus']['description'];
        }

        // sends the out put to the view
        $this->View()->assign(array(
            'success' => true,
            'data'    => $data
        ));

    }
}