<?php

namespace Sedehi\Artist\Tests\Temp\Resources;

use Sedehi\Artist\Fields\Text;
use Sedehi\Artist\Resource;
use Sedehi\Artist\Tests\Models\TempModel;

class TestResource extends Resource
{
    public static $model = TempModel::class;
    public static $perPage = 10;

    public function fields()
    {
        return [
            Text::make()
                ->name('name')
                ->label('Name :')
            ->htmlAttributes([
                'disabled' => true
            ]),
            Text::make()->name('email')->label('Email :')
        ];
    }
}
