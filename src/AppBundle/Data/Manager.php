<?php namespace AppBundle\Data;

class Manager
{
    private $fileH = null;
    private $data = [];
    private $fileName = '';

    public function __construct($type)
    {
        $this->fileName = __DIR__ . '/data/' . $type . '.dc';
        $this->reset();
    }

    public function retrieveAll()
    {
        return $this->getData();
    }

    public function retrieve($id)
    {
        return $this->findItem($id);
    }

    public function persist($entity = null)
    {
        $data = $this->getData();

        if ($entity) {
            $values = $this->getValues($entity);
            if ($id = $entity->getId()) {
                $this->copyToItem($id, $values);
                $values['id'] = $id;
            } else {
                $values['id'] = isset($data[count($data) - 1]) ? $data[count($data) - 1]->id + 1 : 1;
                $data[] = $values;
            }
        }

        ftruncate($this->fileH, 0);
        fwrite($this->fileH, json_encode(array_values($data)));

        //reset data
        $this->reset();

        return @$values['id'];
    }

    public function delete($id)
    {
        $item = $this->findItem($id);
        $data = &$this->getData();

        $key = array_search($item, $data);

        unset($data[$key]);

        $this->persist();
    }

    private function &getData()
    {
        $length = filesize($this->fileName);

        if ($length && empty($this->data)) {
            $this->data = json_decode(fread($this->fileH, $length));
        }

        return $this->data;
    }

    private function &findItem($id)
    {
        $allData = $this->getData();

        foreach ($allData as &$item) {

            if ($item->id == $id) {
                return $item;
            }
        }
    }

    private function reset()
    {
        if ($this->fileH) {
            fclose($this->fileH);
        }

        $this->fileH = fopen($this->fileName, 'a+');
        $this->data = [];
    }

    private function getValues($entity)
    {
        $reflection = new \ReflectionClass($entity);
        $values = [];

        foreach ($reflection->getProperties() as $prop) {

            if ($prop->isPublic()) {
                $values[$prop->getName()] = $prop->getValue($entity);
            }
        }

        return $values;
    }

    private function copyToItem($id, $values)
    {
        $item = $this->findItem($id);

        foreach ($values as $key => $value) {
            $item->$key = $value;
        }
    }
}