<?php

namespace Sedehi\Artist\Tests\Unit\Fields;

use Sedehi\Artist\Fields\Text;
use Sedehi\Artist\Tests\ArtistTestCase;

class FieldTest extends ArtistTestCase
{
    public function test_dynamic_properties()
    {
        $field = Text::make()
            ->name('name')
            ->label('Name: ')
            ->htmlAttributes([
                'id'        => 'test',
                'disabled'  => true,
            ])
            ->sortable();

        $this->assertEquals('name', $field->getName());
        $this->assertEquals('Name: ', $field->getLabel());
        $this->assertEquals([
            'id'        => 'test',
            'disabled'  => true,
        ], $field->getHtmlAttributes());
        $this->assertEquals(true, $field->getSortable());
    }

    public function test_default_value()
    {
        $field = Text::make()
            ->name('name')
            ->default('val');

        $this->assertEquals('val', $field->getDefaultValue());

        $field = Text::make()
            ->name('name')
            ->default(function () {
                return 'test';
            });

        $this->assertEquals('test', $field->getDefaultValue());
    }
}
