<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Survey extends Model
{
    protected $fillable = ['user_id','image','title','description','expire_date','status','created_at','updated_at'];

    use HasSlug;

    /**
     * Get the options for generating the slug.
     */
    public function getSlugOptions() : SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug');
    }
    public function questions() {
        return $this->hasMany(SurveyQuestion::class);
    }
    public function answers() {
        return $this->hasMany(SurveyAnswer::class);
    }
}
