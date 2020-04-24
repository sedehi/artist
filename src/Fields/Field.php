<?php

namespace Sedehi\Artist\Fields;

use Sedehi\Artist\Traits\ValidationRule;
use Sedehi\Artist\Traits\Visibility;

class Field
{
    use Visibility, ValidationRule;

    protected $model;
    protected $label;
    protected $name;
    public $htmlAttributes = [];
    protected $sortable = false;
    protected $defaultValue;
    protected $readOnly = false;
    protected $searchRules = null;
    protected $defaultClass = 'form-control';

    public function __construct()
    {
        $this->htmlAttributes['class'] = $this->defaultClass;
        $this->htmlAttributes['type'] = $this->type;
    }

    public function __call($method, $args)
    {
        if (substr(strtolower($method), 0, 3) === 'get') {
            return $this->{lcfirst(substr($method, 3))};
        }

        $this->{$method} = $args[0];

        return $this;
    }

    public function htmlAttribute($value)
    {
        $this->htmlAttributes = array_merge($this->htmlAttributes,$value);

        return $this;
    }

    public function name($name)
    {
        $this->name = $name;
        $this->htmlAttributes['id'] = $name;
        $this->htmlAttributes['name'] = $name;
        return $this;
    }

    public function render()
    {
        return view($this->viewPath, [
            'field' => $this
        ])->render();
    }

    public function sortable()
    {
        $this->sortable = true;

        return $this;
    }

    public function search($rules)
    {
        $this->searchRules = $rules;

        return $this;
    }

    public function isSorting($type = 'asc')
    {
        return true;
    }

    public function canSort()
    {
        return true;
    }

    public function default($value = null)
    {
        if (! is_callable($value)) {
            $this->defaultValue = $value;

            return $this;
        }

        $this->defaultValue = call_user_func($value);

        return $this;
    }

    public function readonly($callback = true)
    {
        if (! is_callable($callback)) {
            $this->readOnly = (bool) $callback;
            if ($this->readOnly) {
                $this->htmlAttributes['disabled'] = true;
            }

            return $this;
        }

        $this->readOnly = (bool) call_user_func($callback);

        if ($this->readOnly) {
            $this->htmlAttributes['disabled'] = true;
        }

        return $this;
    }

    public function getHtmlAttribute($key = null)
    {
        if (is_null($key)) {
            return $this->htmlAttributes;
        }

        if (isset($this->htmlAttributes[$key])) {
            return $this->htmlAttributes[$key];
        }

        return null;
    }

    public function getLabel()
    {
        return isset($this->label) ? $this->label : trans('validation.attributes.'.$this->name);
    }

    public function value()
    {
        return optional($this->model)->{$this->name};
    }

    public function appendClass($value)
    {
        $this->htmlAttributes['class'] .= ' '.$value;

        return $this;
    }

    public function model($model)
    {
        $this->model = $model;

        return $this;
    }
}
