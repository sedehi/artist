<?php

namespace Sedehi\Artist\Tests\Unit\Fields;

use Sedehi\Artist\Fields\Textarea;
use Sedehi\Artist\Tests\ArtistTestCase;

class TextareaFieldTest extends ArtistTestCase
{
    /**
     * @test
     */
    public function set_placeholder()
    {
        $field = Textarea::make()
            ->name('name')
            ->placeholder('test PlaceHolder');

        $this->assertArrayHasKey('placeholder', $field->getHtmlAttributes());
    }

    /**
     * @test
     */
    public function set_rows()
    {
        $field = Textarea::make()
            ->name('name')
            ->rows(5);

        $this->assertArrayHasKey('rows', $field->getHtmlAttributes());
        $this->assertEquals(5, $field->getHtmlAttributes()['rows']);
    }
}
