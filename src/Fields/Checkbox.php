<?php

namespace Sedehi\Artist\Fields;

class Checkbox extends Field
{
    protected $viewPath = 'artist::fields.checkbox';
    public $type = 'checkbox';

    private $trueValue = 1;
    private $falseValue = 0;

    public static function make()
    {
        return new self;
    }

    public function trueValue($value)
    {
        $this->trueValue = $value;

        return $this;
    }

    public function falseValue($value)
    {
        $this->falseValue = $value;

        return $this;
    }

    public function getTrueValue()
    {
        return $this->trueValue;
    }

    public function getFalseValue()
    {
        return $this->falseValue;
    }

    public function storeValue($request)
    {
        return $request->has($this->getName()) ? $this->trueValue : $this->falseValue;
    }
}
