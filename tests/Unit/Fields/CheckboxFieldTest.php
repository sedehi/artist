<?php

namespace Sedehi\Artist\Tests\Unit\Fields;

use Sedehi\Artist\Fields\Checkbox;
use Sedehi\Artist\Tests\ArtistTestCase;

class CheckboxFieldTest extends ArtistTestCase
{
    /**
     * @test
     */
    public function set_type()
    {
        $field = Checkbox::make()->name('status');

        $this->assertEquals('checkbox', $field->type);
    }

    /**
     * @test
     */
    public function set_true_false_values()
    {
        $field = Checkbox::make()
            ->name('status')
            ->trueValue('on')
            ->falseValue('off');

        $this->assertEquals('on', $field->getTrueValue());
        $this->assertEquals('off', $field->getFalseValue());
    }
}
