<?php

namespace Sedehi\Artist\Fields;

use Sedehi\Artist\Traits\ValidationRule;
use Sedehi\Artist\Traits\Visibility;

class Field
{
    use Visibility, ValidationRule;

    protected $label;
    protected $name;
    public $htmlAttributes = [];
    protected $sortable = false;
    protected $defaultValue;
    protected $readOnly = false;
    protected $searchRules = null;

    public function __call($method, $args)
    {
        if (substr(strtolower($method), 0, 3) === 'get') {
            return $this->{lcfirst(substr($method, 3))};
        }

        $this->{$method} = $args[0];

        return $this;
    }

    public function __toString()
    {
        return view($this->viewPath, ['data' => $this])->render();
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
}
