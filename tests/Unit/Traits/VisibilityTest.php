<?php

namespace Sedehi\Artist\Tests\Unit\Traits;

use Sedehi\Artist\Fields\Text;
use Sedehi\Artist\Tests\ArtistTestCase;

class VisibilityTest extends ArtistTestCase
{
    /**
     * @test
     */
    public function index_visibility()
    {
        // ShowOnIndex
        $field = Text::make()->name('name');
        $this->assertTrue($field->getShowOnIndex());

        $field = Text::make()->name('name')->showOnIndex();
        $this->assertTrue($field->getShowOnIndex());

        $field = Text::make()->name('name')->showOnIndex(0);
        $this->assertFalse($field->getShowOnIndex());

        $field = Text::make()->name('name')->showOnIndex(1);
        $this->assertTrue($field->getShowOnIndex());

        $field = Text::make()->name('name')->showOnIndex(false);
        $this->assertFalse($field->getShowOnIndex());

        $field = Text::make()->name('name')->showOnIndex(true);
        $this->assertTrue($field->getShowOnIndex());

        $field = Text::make()->name('name')->showOnIndex(function () {
            return true;
        });
        $this->assertTrue($field->getShowOnIndex());

        $field = Text::make()->name('name')->showOnIndex(function () {
            return false;
        });
        $this->assertFalse($field->getShowOnIndex());

        // HideOnIndex
        $field = Text::make()->name('name')->hideOnIndex();
        $this->assertFalse($field->getShowOnIndex());

        $field = Text::make()->name('name')->hideOnIndex(0);
        $this->assertTrue($field->getShowOnIndex());

        $field = Text::make()->name('name')->hideOnIndex(1);
        $this->assertFalse($field->getShowOnIndex());

        $field = Text::make()->name('name')->hideOnIndex(false);
        $this->assertTrue($field->getShowOnIndex());

        $field = Text::make()->name('name')->hideOnIndex(true);
        $this->assertFalse($field->getShowOnIndex());

        $field = Text::make()->name('name')->hideOnIndex(function () {
            return true;
        });
        $this->assertFalse($field->getShowOnIndex());

        $field = Text::make()->name('name')->hideOnIndex(function () {
            return false;
        });
        $this->assertTrue($field->getShowOnIndex());

        // OnlyOnIndex
        $field = Text::make()->name('name')->onlyOnIndex();
        $this->assertTrue($field->getShowOnIndex());
        $this->assertFalse($field->getShowOnDetail());
        $this->assertFalse($field->getShowOnCreate());
        $this->assertFalse($field->getShowOnUpdate());
    }

    /**
     * @test
     */
    public function details_visibility()
    {
        // ShowOnDetail
        $field = Text::make()->name('name');
        $this->assertTrue($field->getShowOnDetail());

        $field = Text::make()->name('name')->showOnDetail();
        $this->assertTrue($field->getShowOnDetail());

        $field = Text::make()->name('name')->showOnDetail(0);
        $this->assertFalse($field->getShowOnDetail());

        $field = Text::make()->name('name')->showOnDetail(1);
        $this->assertTrue($field->getShowOnDetail());

        $field = Text::make()->name('name')->showOnDetail(false);
        $this->assertFalse($field->getShowOnDetail());

        $field = Text::make()->name('name')->showOnDetail(true);
        $this->assertTrue($field->getShowOnDetail());

        $field = Text::make()->name('name')->showOnDetail(function () {
            return true;
        });
        $this->assertTrue($field->getShowOnDetail());

        $field = Text::make()->name('name')->showOnDetail(function () {
            return false;
        });
        $this->assertFalse($field->getShowOnDetail());

        // HideOnDetail
        $field = Text::make()->name('name')->hideOnDetail();
        $this->assertFalse($field->getShowOnDetail());

        $field = Text::make()->name('name')->hideOnDetail(0);
        $this->assertTrue($field->getShowOnDetail());

        $field = Text::make()->name('name')->hideOnDetail(1);
        $this->assertFalse($field->getShowOnDetail());

        $field = Text::make()->name('name')->hideOnDetail(false);
        $this->assertTrue($field->getShowOnDetail());

        $field = Text::make()->name('name')->hideOnDetail(true);
        $this->assertFalse($field->getShowOnDetail());

        $field = Text::make()->name('name')->hideOnDetail(function () {
            return true;
        });
        $this->assertFalse($field->getShowOnDetail());

        $field = Text::make()->name('name')->hideOnDetail(function () {
            return false;
        });
        $this->assertTrue($field->getShowOnDetail());

        // OnlyOnDetail
        $field = Text::make()->name('name')->onlyOnDetail();
        $this->assertTrue($field->getShowOnDetail());
        $this->assertFalse($field->getShowOnIndex());
        $this->assertFalse($field->getShowOnCreate());
        $this->assertFalse($field->getShowOnUpdate());
    }

    /**
     * @test
     */
    public function create_visibility()
    {
        // ShowOnCreate
        $field = Text::make()->name('name');
        $this->assertTrue($field->getShowOnCreate());

        $field = Text::make()->name('name')->showOnCreate();
        $this->assertTrue($field->getShowOnCreate());

        $field = Text::make()->name('name')->showOnCreate(0);
        $this->assertFalse($field->getShowOnCreate());

        $field = Text::make()->name('name')->showOnCreate(1);
        $this->assertTrue($field->getShowOnCreate());

        $field = Text::make()->name('name')->showOnCreate(false);
        $this->assertFalse($field->getShowOnCreate());

        $field = Text::make()->name('name')->showOnCreate(true);
        $this->assertTrue($field->getShowOnCreate());

        $field = Text::make()->name('name')->showOnCreate(function () {
            return true;
        });
        $this->assertTrue($field->getShowOnCreate());

        $field = Text::make()->name('name')->showOnCreate(function () {
            return false;
        });
        $this->assertFalse($field->getShowOnCreate());

        // HideOnCreate
        $field = Text::make()->name('name')->hideOnCreate();
        $this->assertFalse($field->getShowOnCreate());

        $field = Text::make()->name('name')->hideOnCreate(0);
        $this->assertTrue($field->getShowOnCreate());

        $field = Text::make()->name('name')->hideOnCreate(1);
        $this->assertFalse($field->getShowOnCreate());

        $field = Text::make()->name('name')->hideOnCreate(false);
        $this->assertTrue($field->getShowOnCreate());

        $field = Text::make()->name('name')->hideOnCreate(true);
        $this->assertFalse($field->getShowOnCreate());

        $field = Text::make()->name('name')->hideOnCreate(function () {
            return true;
        });
        $this->assertFalse($field->getShowOnCreate());

        $field = Text::make()->name('name')->hideOnCreate(function () {
            return false;
        });
        $this->assertTrue($field->getShowOnCreate());

        // OnlyOnForms
        $field = Text::make()->name('name')->onlyOnForms();
        $this->assertTrue($field->getShowOnCreate());
        $this->assertTrue($field->getShowOnUpdate());
        $this->assertFalse($field->getShowOnDetail());
        $this->assertFalse($field->getShowOnIndex());

        // ExceptOnForms
        $field = Text::make()->name('name')->exceptOnForms();
        $this->assertFalse($field->getShowOnCreate());
        $this->assertFalse($field->getShowOnUpdate());
        $this->assertTrue($field->getShowOnDetail());
        $this->assertTrue($field->getShowOnIndex());
    }

    /**
     * @test
     */
    public function update_visibility()
    {
        // ShowOnUpdate
        $field = Text::make()->name('name');
        $this->assertTrue($field->getShowOnUpdate());

        $field = Text::make()->name('name')->showOnUpdate();
        $this->assertTrue($field->getShowOnUpdate());

        $field = Text::make()->name('name')->showOnUpdate(0);
        $this->assertFalse($field->getShowOnUpdate());

        $field = Text::make()->name('name')->showOnUpdate(1);
        $this->assertTrue($field->getShowOnUpdate());

        $field = Text::make()->name('name')->showOnUpdate(false);
        $this->assertFalse($field->getShowOnUpdate());

        $field = Text::make()->name('name')->showOnUpdate(true);
        $this->assertTrue($field->getShowOnUpdate());

        $field = Text::make()->name('name')->showOnUpdate(function () {
            return true;
        });
        $this->assertTrue($field->getShowOnUpdate());

        $field = Text::make()->name('name')->showOnUpdate(function () {
            return false;
        });
        $this->assertFalse($field->getShowOnUpdate());

        // HideOnUpdate
        $field = Text::make()->name('name')->hideOnUpdate();
        $this->assertFalse($field->getShowOnUpdate());

        $field = Text::make()->name('name')->hideOnUpdate(0);
        $this->assertTrue($field->getShowOnUpdate());

        $field = Text::make()->name('name')->hideOnUpdate(1);
        $this->assertFalse($field->getShowOnUpdate());

        $field = Text::make()->name('name')->hideOnUpdate(false);
        $this->assertTrue($field->getShowOnUpdate());

        $field = Text::make()->name('name')->hideOnUpdate(true);
        $this->assertFalse($field->getShowOnUpdate());

        $field = Text::make()->name('name')->hideOnUpdate(function () {
            return true;
        });
        $this->assertFalse($field->getShowOnUpdate());

        $field = Text::make()->name('name')->hideOnUpdate(function () {
            return false;
        });
        $this->assertTrue($field->getShowOnUpdate());

        // OnlyOnForms
        $field = Text::make()->name('name')->onlyOnForms();
        $this->assertTrue($field->getShowOnCreate());
        $this->assertTrue($field->getShowOnUpdate());
        $this->assertFalse($field->getShowOnDetail());
        $this->assertFalse($field->getShowOnIndex());

        // ExceptOnForms
        $field = Text::make()->name('name')->exceptOnForms();
        $this->assertFalse($field->getShowOnCreate());
        $this->assertFalse($field->getShowOnUpdate());
        $this->assertTrue($field->getShowOnDetail());
        $this->assertTrue($field->getShowOnIndex());
    }
}
