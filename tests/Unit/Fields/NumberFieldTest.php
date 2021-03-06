<?php

namespace Sedehi\Artist\Tests\Unit\Fields;

use Sedehi\Artist\Fields\Number;
use Sedehi\Artist\Tests\ArtistTestCase;

class NumberFieldTest extends ArtistTestCase
{
    /**
     * @test
     */
    public function set_type()
    {
        $field = Number::make()->name('age');

        $this->assertEquals('number', $field->type);
    }
}
