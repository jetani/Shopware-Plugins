<?php

namespace Shopware\CustomModels\Position;

use Shopware\Components\Model\ModelEntity;
use Doctrine\ORM\Mapping as ORM;


/**
 * @ORM\Entity
 * @ORM\Table(name="bi_position_history")
 */
class History extends ModelEntity
{
    /**
     * @var integer $id
     * @ORM\Column(name="id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var integer $positionId
     * @ORM\Column(name="orderID", type="integer", nullable=false)
     */
    private $orderId;

    /**
     * @var integer $positionId
     * @ORM\Column(name="positionID", type="integer", nullable=false)
     */
    private $positionId;

    /**
     * @var integer $userId
     * @ORM\Column(name="userID", type="integer", nullable=true)
     */
    private $userId = null;

    /**
     * @var integer
     * @ORM\Column(name="previous_position_status_id", type="integer", nullable=true)
     */
    private $previousPositionStatusId = null;

    /**
     * @var integer $positionStatusId
     * @ORM\Column(name="position_status_id", type="integer", nullable=true)
     */
    private $positionStatusId = null;


    /**
     * @ORM\ManyToOne(targetEntity="\Shopware\Models\Order\Detail")
     * @ORM\JoinColumn(name="positionID", referencedColumnName="id")
     * @var \Shopware\Models\Order\Detail $position
     */
    private $position;

    /**
     * @ORM\ManyToOne(targetEntity="\Shopware\Models\User\User")
     * @ORM\JoinColumn(name="userID", referencedColumnName="id")
     * @var \Shopware\Models\User\User $order
     */
    private $user;

    /**
     * @ORM\ManyToOne(targetEntity="\Shopware\Models\Order\DetailStatus")
     * @ORM\JoinColumn(name="previous_position_status_id", referencedColumnName="id")
     * @var \Shopware\Models\Order\DetailStatus $previousPositionStatus
     */
    private $previousPositionStatus;

    /**
     * @ORM\ManyToOne(targetEntity="\Shopware\Models\Order\DetailStatus")
     * @ORM\JoinColumn(name="position_status_id", referencedColumnName="id")
     * @var \Shopware\Models\Order\DetailStatus $positionStatus
     */
    private $positionStatus;

    /**
     * @var string $changeDate
     * @ORM\Column(name="change_date", type="string", nullable=false)
     */
    private $changeDate;


    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param $orderId
     */
    public function setOrderId($orderId)
    {
        $this->orderId = $orderId;
    }

    /**
     * @return int
     */
    public function getOrderId()
    {
        return $this->orderId;
    }

    /**
     * @param $user
     * @return $this
     */
    public function setUser($user)
    {
        $this->user = $user;
        return $this;
    }

    /**
     * @return \Shopware\Models\User\User
     */
    public function getUser()
    {
        return $this->user;
    }


    /**
     * @param $position
     * @return $this
     */
    public function setPosition($position)
    {
        $this->position = $position;
        return $this;
    }

    /**
     * @return \Shopware\Models\Order\Detail
     */
     public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param $positionStatus
     * @return $this
     */
    public function setPositionStatus($positionStatus)
    {
        $this->positionStatus = $positionStatus;
        return $this;
    }

    /**
     * @return \Shopware\Models\Order\DetailStatus
     */
    public function getPositionStatus()
    {
        return $this->positionStatus;
    }

    /**
     * @param $previousPositionStatus
     * @return $this
     */
   public function setPreviousPositionStatus($previousPositionStatus)
    {
        $this->previousPositionStatus = $previousPositionStatus;
        return $this;
    }

    /**
     * @return \Shopware\Models\Order\DetailStatus
     */
    public function getPreviousPositionStatus()
    {
        return $this->previousPositionStatus;
    }

    /**
     * @return string
     */
   public function getChangeDate()
    {
        return $this->changeDate;
    }

    /**
     * @param $changeDate
     */
     public function setChangeDate($changeDate)
    {
        $this->changeDate = $changeDate;
    }

}
