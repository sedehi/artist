<?php

namespace Sedehi\Artist\Tests\Unit\Fields;

use Sedehi\Artist\Fields\Radio;
use Sedehi\Artist\Tests\ArtistTestCase;

class RadioFieldTest extends ArtistTestCase
{
    /**
     * @test
     */
    public function set_type()
    {
        $field = Radio::make()->name('color');

        $this->assertEquals('radio', $field->type);
    }

    /**
     * @test
     */
    public function set_options()
    {
        $field = Radio::make()
            ->name('color')
            ->options([
                'S' => 'Small',
                'M' => 'Medium',
                'L' => 'Large',
            ]);

        $this->assertEquals([
            'S' => 'Small',
            'M' => 'Medium',
            'L' => 'Large',
        ], $field->getOptions());
    }
}
