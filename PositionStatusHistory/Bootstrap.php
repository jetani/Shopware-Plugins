<?php
/**
 * Class Shopware_Plugins_Backend_PositionStatusHistory_Bootstrap
 * PositionStatusHistory
 */
class Shopware_Plugins_Backend_PositionStatusHistory_Bootstrap extends Shopware_Components_Plugin_Bootstrap
{
    /**
     * returns the label
     *
     * @return string
     */
    public function getLabel()
    {
    	return 'Position Status History';
    }

    /**
     * returns the version
     *
     * @return string
     */
    public function getVersion()
    {
    	return '1.0.0';
    }

    /**
     * @return array
     */
    public function getInfo()
    {
        return [
            "autor" => "BoostInternet | Jenis Jetani",
            'version' => $this->getVersion(),
            'label' => $this->getLabel(),
            'description' => 'Plugin enable to show position status history in backend Order details'
        ];
    }


    /**
     * @return array|bool
     * @throws Exception
     */
    public function install()
    {
        $this->registerBackendController();
        // Check if shopware version matches
        if (!$this->assertMinimumVersion('5.0.0')) {
            throw new Exception("This plugin requires Shopware 5.0.0 or a later version");
        }
        $this->registerEvents();
        $this->createModel();

        return ['success' => true, 'invalidateCache' => ['backend']];
    }

    /**
     * @return array|bool
     */
    public function uninstall()
    {
        $this->removeModel();
        return ['success' => true, 'invalidateCache' => ['backend']];
    }

    /**
     * function to register events and hooks
     */
    private function registerEvents()
    {
        $this->subscribeEvent(
            'Enlight_Controller_Action_PostDispatch_Backend_Order',
            'onOrderPostDispatch'
        );

        $this->subscribeEvent(
            'Shopware_Controllers_Backend_Order::savePositionAction::before',
            'onBeforeSavePosition'
        );

        $this->subscribeEvent(
            'Shopware_Controllers_Backend_Order::savePositionAction::after',
            'onAfterSavePosition'
        );
    }


    function registerBackendController()
    {
        $this->registerController(
            'Backend',
            'PositionStatusHistory'
        );
    }

    /**
     * This function register customModels.
     *
     * @throws \Doctrine\ORM\Tools\ToolsException
     */
    protected function createModel()
    {
        $this->registerCustomModels();
        $em = $this->Application()->Models();
        $tool = new \Doctrine\ORM\Tools\SchemaTool($em);

        $classes = array(
            $em->getClassMetadata('Shopware\CustomModels\Position\History'),
        );
        $tool->createSchema($classes);
    }


    /**
     * This function register customModels.
     *
     * @throws \Doctrine\ORM\Tools\ToolsException
     */
    protected function removeModel()
    {
        $this->registerCustomModels();
        $em = $this->Application()->Models();
        $tool = new \Doctrine\ORM\Tools\SchemaTool($em);

        $classes = array(
            $em->getClassMetadata('Shopware\CustomModels\Position\History'),
        );
        $tool->dropSchema($classes);
    }

    public function onBeforeSavePosition(Enlight_Hook_HookArgs $args){

        $request = $args->getSubject()->Request();
        $details = $request->getParams();
        file_put_contents(__DIR__."/log.txt", "Details  ".print_r($details, true)."\r\n", FILE_APPEND);
        if($details['id']){
            $getOrderDetailModel = Shopware()->Models()->getRepository('Shopware\Models\Order\Detail')->findOneBy(Array('id' => $details['id']));
            $positionStatus = $getOrderDetailModel->getStatus();
            $statusId = $positionStatus->getId();
            $GLOBALS['old_status'] = $statusId;
            file_put_contents(__DIR__."/log.txt", "Old statusId ".$statusId."\r\n", FILE_APPEND);
        }
    }

    public function onAfterSavePosition(Enlight_Hook_HookArgs $args){

        $request = $args->getSubject()->Request();
        $details = $request->getParams();
        file_put_contents(__DIR__."/log.txt", "details". print_r($details, true)."\r\n", FILE_APPEND);
        file_put_contents(__DIR__."/log.txt", "Old statusId ".$GLOBALS['old_status']."\r\n", FILE_APPEND);

        if($details['statusId'] != $GLOBALS['old_status']){

            $oldStatusModel = Shopware()->Models()->getRepository('Shopware\Models\Order\DetailStatus')->findOneBy(Array('id' => $GLOBALS['old_status']));
            $newStatusModel = Shopware()->Models()->getRepository('Shopware\Models\Order\DetailStatus')->findOneBy(Array('id' => $details['statusId']));
            $positionModel = Shopware()->Models()->getRepository('Shopware\Models\Order\Detail')->findOneBy(Array('id' => $details['id']));
            if (is_object($_SESSION['Shopware']['Auth'])) {
                $username = $_SESSION['Shopware']['Auth']->username;
                $userModel = Shopware()->Models()->getRepository('Shopware\Models\User\User')->findOneBy(Array('username' => $username));
            }
            $this->registerCustomModels();
            $positionStatusHistory = new Shopware\CustomModels\Position\History();
            $positionStatusHistory->setChangeDate(date("d.m.Y H:i:s"));
            $positionStatusHistory->setPreviousPositionStatus($oldStatusModel);
            $positionStatusHistory->setPositionStatus($newStatusModel);
            $positionStatusHistory->setPosition($positionModel);
            $positionStatusHistory->setOrderId($details['orderId']);

            if($userModel){
                $positionStatusHistory->setUser($userModel);
            }

            Shopware()->Models()->persist($positionStatusHistory);
            Shopware()->Models()->flush();
        }
    }

    /**
     * @param Enlight_Controller_ActionEventArgs $args
     * @return string
     */
    public function onOrderPostDispatch(Enlight_Controller_ActionEventArgs $args)
    {
    	$view = $args->getSubject()->View();

        // Add snippet directory
        $this->Application()->Snippets()->addConfigDir(
            $this->Path() . 'Snippets/'
        );

        // Add view directory
        $args->getSubject()->View()->addTemplateDir(
            $this->Path() . 'Views/'
        );

        if ($args->getRequest()->getActionName() === 'index') {
            $view->extendsTemplate(
                'backend/order/position_history_app.js'
            );
        }

        if ($args->getRequest()->getActionName() === 'load') {

            $view->extendsTemplate(
                'backend/order/view/detail/position_window.js'
            );

            $view->extendsTemplate(
                'backend/order/view/detail/position_history.js'
            );

            $view->extendsTemplate(
                'backend/order/model/position_history.js'
            );

            $view->extendsTemplate(
                'backend/order/store/position_history.js'
            );
        }
    }
}
