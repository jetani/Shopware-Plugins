<?php
/**
 * Class Shopware_Plugins_Backend_BestellungenNeuLager_Bootstrap
 * BestellungenLager
 */
class Shopware_Plugins_Backend_BestellungenNeuLager_Bootstrap extends Shopware_Components_Plugin_Bootstrap
{
    /**
     * returns the label
     *
     * @return string
     */
    public function getLabel()
    {
    	return 'Kommissionierungsansicht (Weißenfelder Straße)';
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
            'description' => "Dieses Plugin fügt eine Liste \"Kommissionierung (im neu Lager Weißenfelder Straße)\" im Menü \"Kunden\" hinzu. Dort werden alle Bestellungen angezeigt, die aktuell den Status \"Kommissionierungsbereit\" haben und heute vor 12 Uhr eingegangen sind. Das Drucken der Etiketten und Rechnungen ist in dieser Ansicht auf einmal alle 24 Stunden begrenzt. Diese Begrenzung kann man in der Konfiguration abschalten.",
        ];
    }

    public function createMenu(){
        $this->createMenuItem(array(
            'label' => 'Kommissionierungsansicht (Weißenfelder Straße)',
            'controller' => 'BestellungenNeuLager',
            'class' => 'sprite-sticky-notes-pin customers--orders',
            'action' => 'Index',
            'active' => 1,
            'parent' => $this->Menu()->findOneBy(Array('label' => 'Kunden'))
        ));
    }

    /**
     * @return array|bool
     * @throws Exception
     */
    public function install()
    {
        $this->registerEvents();
        $this->createMenu();
        $this->createModelsAttribute();
        $this->createForm();
        try {
            Shopware()->Acl()->createResource('bestellungenneulager', array('read', 'create', 'update','delete'), 'BestellungenNeuLager', $this->getId());
        } catch(Exception $e) {
            //ignore
        }
        return ['success' => true, 'invalidateCache' => ['backend']];
    }

    /**
     * @return array|bool
     */
    public function uninstall()
    {
        try {
            //Shopware()->Acl()->deleteResource('bestellungenneulager');
        } catch(Exception $e) {
            //ignore
        }
        return ['success' => true, 'invalidateCache' => ['backend']];
    }

    /**
     * function to register events and hooks
     */
    private function registerEvents()
    {
        //Backend Controller
        $this->subscribeEvent(
            'Enlight_Controller_Dispatcher_ControllerPath_Backend_BestellungenNeuLager',
            'getBackendController'
        );

        $this->subscribeEvent(
            'Enlight_Controller_Action_PostDispatch_Backend_Order',
            'onOrderPostDispatch'
        );
    }

    /**
     * @param Enlight_Controller_ActionEventArgs $args
     * @return string
     */
    public function onOrderPostDispatch(Enlight_Controller_ActionEventArgs $args)
    {
        $view = $args->getSubject()->View();

        // Add view directory
        $args->getSubject()->View()->addTemplateDir(
            $this->Path() . 'Views/'
        );

        if ($args->getRequest()->getActionName() === 'index') {
            $view->extendsTemplate(
                'backend/order/bestellungen_neu_lager_app.js'
            );
        }
        if ($args->getRequest()->getActionName() === 'load') {
            $view->extendsTemplate(
                'backend/order/controller/my_main.js'
            );
        }
    }

    /**
     * This function set the paths for backend Controller.
     *
     * @param Enlight_Event_EventArgs $args
     * @return string
     */
    public function getBackendController(Enlight_Event_EventArgs $args)
    {
        // Add template and snippet directory
        $this->Application()->Snippets()->addConfigDir(
            $this->Path() . 'Snippets/'
        );
        $this->Application()->Template()->addTemplateDir(
            $this->Path() . 'Views/'
        );
        return $this->Path() . '/Controllers/Backend/BestellungenNeuLager.php';
    }

    /**
     * @throws Enlight_Exception
     */
    private function createModelsAttribute() {
        try {
            // add order attributes
            $this->Application()->Models()->addAttribute(
                's_order_attributes', 'bestellungen_neu_lager', 'process_date', 'DATETIME', true
            );

            $this->Application()->Models()->addAttribute(
                's_order_attributes', 'bestellungen_neu_lager', 'user', 'VARCHAR(255)', true
            );

            Shopware()->Models()->generateAttributeModels(array(
                's_order_attributes',
            ));

        } catch (Exception $e) {
            throw new Enlight_Exception('Problem creating order_attribute for ProcessOrder.');
        }
        $this->registerCustomModels();
    }


    /**
     * Creates and stores the payment config form.
     */
    private function createForm() {
        $form = $this->Form();

        $form->setElement('checkbox', 'unLock24hourPrint', array(
            'label' => '24-Stunden Sperre für Drucken aufheben',
            'value' => 0,
            'scope' => \Shopware\Models\Config\Element::SCOPE_LOCALE
        ));

        $form->setElement('text', 'userAtPacktisch1', array(
            'label' => 'Benutzername bei Packtisch 1',
            'value' => 'Robert',
            'scope' => \Shopware\Models\Config\Element::SCOPE_LOCALE
        ));
    }
}
