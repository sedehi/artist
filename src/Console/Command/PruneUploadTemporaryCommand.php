<?php

namespace Sedehi\Artist\Console\Command;

use Illuminate\Console\Command;
use Sedehi\Artist\Models\UploadTemporary;

class PruneUploadTemporaryCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'artist:prune-upload-temp';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'remove expired temporary uploads';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        UploadTemporary::where('created_at', '<', now()->subMinutes(config('artist.upload_temporary_expire_time')))->chunk(500, function ($items) {
            $items->each->remove();
        });
        $this->info('Done.');
    }
}
