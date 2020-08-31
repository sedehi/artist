<?php

namespace Sedehi\Artist\Tests\Unit\Fields;

use Sedehi\Artist\Fields\Password;
use Sedehi\Artist\Tests\ArtistTestCase;

class PasswordFieldTest extends ArtistTestCase
{
    /**
     * @test
     */
    public function set_type()
    {
        $field = Password::make();

        $this->assertEquals('password', $field->getName());

        $this->assertEquals(false, $field->getUpdateWhenEmpty());
    }
}
