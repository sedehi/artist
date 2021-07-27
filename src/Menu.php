<?php

namespace Sedehi\Artist;

use Illuminate\Support\Facades\Gate;

class Menu
{
    public $url;
    public $title;
    public $attributes;
    public $childs;
    public $permission;
    public $icon;

    public static function make()
    {
        return new self;
    }

    public function url($url)
    {
        $this->url = $url;

        return $this;
    }

    public function title($title)
    {
        $this->title = $title;

        return $this;
    }

    public function permission($permission)
    {
        $this->permission = strtolower($permission);

        return $this;
    }

    public function attributes(array $attributes)
    {
        $this->attributes = $attributes;

        return $this;
    }

    public function childs($item)
    {
        if (! is_array($item)) {
            $item = [$item];
        }
        $this->childs = $item;

        return $this;
    }

    public function icon($icon)
    {
        $this->icon = $icon;

        return $this;
    }

    public function canSee(){
        if(is_null($this->permission)){
            $canSee = false;
            foreach ((array)$this->childs as $child) {
                if($child->canSee()){
                    $canSee = true;
                    break;
                }
            }

            return  $canSee;
        }

        return Gate::allows($this->permission);
    }

    public function render()
    {
        $this->id = 'menu-'.md5($this->title.$this->url.spl_object_id($this));
        if($this->canSee()){
            return view('artist::menu', ['item' => $this]);
        }
    }

    public function isActive()
    {
        return true;
    }
}
