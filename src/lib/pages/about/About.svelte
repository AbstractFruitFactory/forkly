<div class="about-container">
	<div class="about-content">
		<header class="about-header">
			<h1 class="about-title">About Forkly</h1>
			<p class="about-tagline">
				Forkly is a simple, modern way to share and discover recipes — no clutter, no accounts
				required.
			</p>
		</header>

		<section class="about-section">
			<h2 class="section-title">It started with a simple idea:</h2>
			<div class="highlight-question">
				<p>Why is it not easier to share a recipe online?</p>
			</div>
			<p class="section-text">
				Most recipe websites are bloated, ad-ridden, and hard to use. They also tend to be focused
				on curated content rather than community based. On social platforms, people end up copy-pasting
				recipes into comments or screenshots just to share them. Forkly exists to fix that.
			</p>
		</section>

		<section class="about-section">
			<h2 class="section-title">👋 Built by a developer who loves food</h2>
			<p class="section-text">
				Hi, I'm Alex — a software engineer who got tired of jumping through hoops to share a simple
				pasta recipe.
			</p>
			<p class="section-text">I wanted a space where:</p>
			<ul class="feature-list">
				<li>You can post a recipe without friction.</li>
				<li>Finding recipes you want to cook is easy.</li>
				<li>People can browse, search, and cook without distractions.</li>
			</ul>
			<p class="section-text">
				That's what Forkly is. It's minimal on purpose — focused on the essentials, and always
				improving.
			</p>
		</section>

		<section class="about-section">
			<h2 class="section-title">💡 What's next?</h2>
			<p class="section-text">Forkly is still evolving. Features on the way:</p>
			<ul class="feature-list">
				<li>Cooking timers for recipe steps</li>
				<li>Meal planning and grocery lists</li>
				<li>Personalized recipe feeds</li>
				<li>Support for food bloggers and chefs</li>
				<li>... and more!</li>
			</ul>
			<p class="section-text">
				If you have ideas or run into issues, I'd love to hear from you:{' '}
				<a href="mailto:hello@forkly.me" class="contact-link">hello@forkly.me</a>
			</p>
		</section>

		<section class="about-section">
			<h2 class="section-title">
				🍽️ Forkly is for the home cook, the food nerd, and everyone in between.
			</h2>
			<p class="section-text">Thanks for being here. Let's make cooking — and sharing — easier.</p>
		</section>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.about-container {
		background: var(--color-background);
		padding: var(--spacing-xl) var(--spacing-lg);
	}

	.about-content {
		max-width: 800px;
		margin: 0 auto;
		background: var(--color-surface);
		border-radius: var(--border-radius-xl);
		padding: var(--spacing-2xl);
		box-shadow: var(--shadow-lg);

		@include mobile {
			padding: var(--spacing-lg);
			margin: 0 var(--spacing-sm);
		}
	}

	.about-header {
		text-align: center;
		margin-bottom: var(--spacing-2xl);
		padding-bottom: var(--spacing-xl);
		border-bottom: 2px solid var(--color-border);
	}

	.about-title {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		color: var(--color-text-on-surface);
		margin: 0 0 var(--spacing-md) 0;

		@include mobile {
			font-size: var(--font-size-2xl);
		}
	}

	.about-tagline {
		font-size: var(--font-size-lg);
		color: var(--color-text-on-surface);
		opacity: 0.8;
		margin: 0;
		line-height: 1.5;
	}

	.about-section {
		margin-bottom: var(--spacing-2xl);

		&:last-child {
			margin-bottom: 0;
		}
	}

	.section-title {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-on-surface);
		margin: 0 0 var(--spacing-lg) 0;

		@include mobile {
			font-size: var(--font-size-lg);
		}
	}

	.highlight-question {
		background: var(--color-primary-light);
		border-left: 4px solid var(--color-primary);
		padding: var(--spacing-lg);
		margin: var(--spacing-lg) 0;
		border-radius: var(--border-radius-lg);

		p {
			font-size: var(--font-size-lg);
			font-weight: 600;
			color: var(--color-primary);
			margin: 0;
			text-align: center;
		}
	}

	.section-text {
		font-size: var(--font-size-md);
		color: var(--color-text-on-surface);
		line-height: 1.6;
		margin: 0 0 var(--spacing-md) 0;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.feature-list {
		list-style: none;
		padding: 0;
		margin: var(--spacing-md) 0 var(--spacing-lg) 0;
	}

	.feature-list li {
		position: relative;
		padding-left: var(--spacing-xl);
		margin-bottom: var(--spacing-md);
		color: var(--color-text-on-surface);
		font-size: var(--font-size-md);

		&:last-child {
			margin-bottom: 0;
		}

		&::before {
			content: '•';
			position: absolute;
			left: 0;
			color: var(--color-primary);
			font-weight: bold;
			font-size: var(--font-size-lg);
		}
	}

	.contact-link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
		transition: color var(--transition-fast) var(--ease-in-out);

		&:hover {
			color: var(--color-primary-dark);
			text-decoration: underline;
		}
	}
</style>
