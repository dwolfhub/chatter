<?php namespace Dwolf555\Chatter;

use Illuminate\Support\ServiceProvider;

class ChatterServiceProvider extends ServiceProvider {

	/**
	 * Indicates if loading of the provider is deferred.
	 *
	 * @var bool
	 */
	protected $defer = false;

	/**
	 * Register the service provider.
	 *
	 * @return void
	 */
	public function register()
	{
		$this->app->bind('chatter.emitter', function ()
		{
			return new EventEmitter();
		});

		$this->app->bind('chatter.chat', function ()
		{
			return new Chat(
				$this->app->make('chatter.emitter')
			);
		});

		$this->app->bind('chatter.user', function ()
		{
			return new User();
		});

		$this->app->bind('chatter.command.serve', function ()
		{
			return new Command\Serve(
				$this->app->make('chatter.chat')
			);
		});

		$this->commands('chatter.command.serve');
	}

	/**
	 * Get the services provided by the provider.
	 *
	 * @return array
	 */
	public function provides()
	{
		return array(
			'chatter.chat',
			'chatter.command.serve',
			'chatter.emitter',
			'chatter.server'
		);
	}

}