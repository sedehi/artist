<?php

namespace Sedehi\Artist\Tests\Unit\Fields;

use Sedehi\Artist\Fields\Text;
use Sedehi\Artist\Tests\ArtistTestCase;

class TextFieldTest extends ArtistTestCase
{
    /**
     * @test
     */
    public function set_placeholder()
    {
        $field = Text::make()
            ->name('name')
            ->placeholder('test PlaceHolder');

        $this->assertArrayHasKey('placeholder',$field->getHtmlAttributes());

    }
}
