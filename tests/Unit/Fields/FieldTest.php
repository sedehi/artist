<?php

namespace Sedehi\Artist\Tests\Unit\Fields;

use Sedehi\Artist\Fields\Hidden;
use Sedehi\Artist\Fields\Text;
use Sedehi\Artist\Tests\ArtistTestCase;

class FieldTest extends ArtistTestCase
{
    /**
     * @test
     */
    public function dynamic_properties()
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

    /**
     * @test
     */
    public function default_value()
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

    /**
     * @test
     */
    public function readonly()
    {
        $field = Text::make()
            ->name('name')
            ->readOnly();

        $this->assertTrue($field->getReadOnly());
        $this->assertArrayHasKey('disabled', $field->getHtmlAttributes());

        $field = Text::make()
            ->name('name')
            ->readOnly(function () {
                return true;
            });

        $this->assertTrue($field->getReadOnly());
        $this->assertArrayHasKey('disabled', $field->getHtmlAttributes());

        $field = Text::make()
            ->name('name')
            ->readOnly(function () {
                return false;
            });

        $this->assertFalse($field->getReadOnly());
        $this->assertArrayNotHasKey('disabled', $field->getHtmlAttributes());
    }

    /**
     * @test
     */
    public function html_field_type()
    {
        $field = Text::make()->name('name');

        $this->assertEquals('text', $field->type);

        $field = Hidden::make()->name('name');

        $this->assertEquals('hidden', $field->type);
    }

    /**
     * @test
     */
    /*public function html_disabled_attribute()
    {
        $response = $this->get(route('artist.resource.create',[
            'TestResource'
        ]));

        dd($response->assertSee('disabled'));

        $field = Text::make()
            ->name('name')
            ->readOnly();

        $this->assertArrayHasKey('disabled', $field->getHtmlAttributes());
        $this->assertStringContainsString('disabled', $field->render());

        $field = Text::make()
            ->name('name')
            ->htmlAttributes([
                'disabled'  =>  true,
            ]);

        $this->assertArrayHasKey('disabled', $field->getHtmlAttributes());
        $this->assertStringContainsString('disabled', $field->render());
    }*/
}
