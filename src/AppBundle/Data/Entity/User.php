<?php namespace AppBundle\Data\Entity;

class User
{
    public $name;
    public $email;
    public $categories;
    public $created_date;

    private $id = 0;

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getId()
    {
        return $this->id;
    }
}