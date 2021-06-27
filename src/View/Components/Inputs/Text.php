<?php

namespace Sedehi\Artist\View\Components\Inputs;

use Illuminate\View\Component;

class Text extends Component
{
    public $grid = 'col-md-6';
    public $model;
    public $title;
    public $class;
    public $value;
    public $field;
    public $type = 'text';

    /**
     * Create a new component instance.
     *
     * @return void
     */
    public function __construct($field = null, $model = null)
    {
        $this->model = $model;
        $this->field = $field;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\Contracts\View\View|\Closure|string
     */
    public function render()
    {
        return view('artist::components.inputs.text');
    }
}
