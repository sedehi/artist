<?php

namespace Sedehi\Artist\Fields;

use Illuminate\Support\Str;
use Sedehi\Artist\Traits\Visibility;

class Panel
{
    use Visibility;

    protected $label;
    protected $fields;
    protected $name;
    public $type = 'panel';

    public function __construct($label, array $fields, $name = null)
    {
        $this->label = $label;
        $this->fields = $fields;
        if ($name === null) {
            $this->name = Str::slug($label);
        }
    }

    public function fields(array $fields)
    {
        $this->fields = $fields;
    }

    public function fieldsForIndex()
    {
        return array_filter($this->fields, function ($field) {
            return $field->getShowOnIndex();
        });
    }

    public function fieldsForCreate()
    {
        return array_filter($this->fields, function ($field) {
            return $field->getShowOnCreate();
        });
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

    public function getName()
    {
        return $this->name;
    }
}
