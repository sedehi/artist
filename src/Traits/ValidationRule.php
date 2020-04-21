<?php

namespace Sedehi\Artist\Traits;

trait ValidationRule
{
    protected $rules = [];
    protected $creationRules = [];
    protected $updateRules = [];

    public function rules(...$args)
    {
        $this->rules = array_merge(
            $this->rules,
            is_array($args[0]) ? $args[0] : $args
        );

        return $this;
    }

    public function creationRules(...$args)
    {
        $this->creationRules = array_merge(
            $this->creationRules,
            is_array($args[0]) ? $args[0] : $args
        );

        return $this;
    }

    public function getCreationRules()
    {
        return array_merge(
            $this->rules,
            $this->creationRules
        );
    }

    public function updateRules(...$args)
    {
        $this->updateRules = array_merge(
            $this->updateRules,
            is_array($args[0]) ? $args[0] : $args
        );

        return $this;
    }

    public function getUpdateRules()
    {
        return array_merge(
            $this->rules,
            $this->updateRules
        );
    }
}
