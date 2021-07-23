<?php

namespace Sedehi\Artist\Http\Controllers;

use Illuminate\Http\Request;

class ActionController extends BaseController
{
    public function __invoke(Request $request)
    {
        $model = null;
        $action = $request->get('action');
        if ($request->filled('model')) {
            $model = $request->get('model');
            $model = $model::find($request->get('primary_key'));
        }

        $action::dispatch($model);
        $actionClass = new $action;
        return redirect()->back()->with('success',$actionClass->successText);
    }
}
