<?php

namespace Sedehi\Artist\Fields;

use Sedehi\Artist\Traits\Visibility;

class Field
{
    use Visibility;

    protected $label;
    protected $name;
    protected $htmlAttributes = [];
    protected $sortable = false;
    protected $defaultValue;
    protected $readOnly = false;

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
            $this->readOnly = (boolean) $callback;
            if ($this->readOnly) {
                $this->htmlAttributes['disabled'] = true;
            }
            return $this;
        }

        $this->readOnly = (boolean) call_user_func($callback);

        if ($this->readOnly) {
            $this->htmlAttributes['disabled'] = true;
        }

        return $this;
    }
}
