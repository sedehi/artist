<?php

namespace Sedehi\Artist\Tests\Unit\Fields;

use Sedehi\Artist\Fields\Select;
use Sedehi\Artist\Tests\ArtistTestCase;

class SelectFieldTest extends ArtistTestCase
{
    /**
     * @test
     */
    public function set_type()
    {
        $field = Select::make()->name('status');

        $this->assertEquals('select', $field->type);
    }

    /**
     * @test
     */
    public function set_options()
    {
        $field = Select::make()
            ->name('status')
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
