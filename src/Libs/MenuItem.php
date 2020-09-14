<?php

namespace Sedehi\Artist\Libs;

class MenuItem
{
    private $name;
    private $link;
    private $children = [];
    private $parent;
    public $htmlAttributes = [];
    protected $defaultClass = 'menu-item';

    public function __construct()
    {
        $this->htmlAttributes['class'] = $this->defaultClass;
    }

    public static function make()
    {
        return new self;
    }

    public function __call($method, $args)
    {
        if (substr(strtolower($method), 0, 3) === 'get') {
            return $this->{lcfirst(substr($method, 3))};
        }

        $this->{$method} = $args[0];

        return $this;
    }

    public function label($label)
    {
        $this->name = $label;

        return $this;
    }

    public function url($url)
    {
        $this->link = $url;

        return $this;
    }

    public function htmlAttribute($value)
    {
        $this->htmlAttributes = array_merge($this->htmlAttributes, $value);

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
    }

    public function appendClass($value)
    {
        $this->defaultClass .= ' '.$value;

        $this->htmlAttributes['class'] = $this->defaultClass;

        return $this;
    }

    public function action($action, $params = [])
    {
        $this->link = action($action, $params);

        return $this;
    }

    public function children($items = [])
    {
        $this->children = $items;

        return $this;
    }

    public function parent($item)
    {
        $this->parent = $item;

        return $this;
    }
}
