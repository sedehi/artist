<?php


namespace Sedehi\Artist\Fields;


use Illuminate\Support\Str;

class Panel
{
    protected $label;
    protected $fields;
    protected $name;
    public $type = 'panel';

    public function __construct($label,array $fields,$name=null)
    {
        $this->label = $label;
        $this->fields = $fields;
        if($name === null){
            $this->name = Str::slug($label);
        }
    }

    public function fields(array $fields)
    {
        $this->fields = $fields;
    }

    public function name($fields)
    {
        $this->fields = $fields;
    }

    public function getFields()
    {
        return $this->fields;
    }

    public function model($model)
    {

    }

    public function getLabel()
    {
        return $this->label;
    }
}
