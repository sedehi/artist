<?php

namespace Sedehi\Artist\Fields;

class Radio extends Field
{
    protected $viewPath = 'artist::fields.radio';
    public $type = 'radio';

    public $options = [];
    protected $displayUsingLabels = false;

    public static function make()
    {
        return new self;
    }

    public function options($options)
    {
        if (! is_callable($options)) {
            $this->options = $options;

            return $this;
        }

        $this->options = call_user_func($options);

        return $this;
    }

    public function displayUsingLabels()
    {
        $this->displayUsingLabels = true;

        return $this;
    }

    public function value()
    {
        $value = optional($this->model)->{$this->columnName ?? $this->name};

        if ($this->displayUsingLabels && isset($this->options[$value])) {
            return $this->options[$value];
        }

        return $value;
    }
}
