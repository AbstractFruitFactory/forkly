<div class="about-container">
	<section class="hero">
		<h1>About Forkly</h1>
		<p class="tagline">Your personal recipe management and nutrition tracking companion</p>
	</section>

	<section class="features">
		<h2>What We Offer</h2>
		<div class="feature-grid">
			<div class="feature">
				<span class="icon">📝</span>
				<h3>Recipe Creation</h3>
				<p>Create and store your favorite recipes with our easy-to-use recipe builder</p>
			</div>

			<div class="feature">
				<span class="icon">📊</span>
				<h3>Nutrition Tracking</h3>
				<p>Get detailed nutrition information for your recipes using our ingredient database</p>
			</div>

			<div class="feature">
				<span class="icon">🔍</span>
				<h3>Smart Search</h3>
				<p>Find ingredients quickly with our intelligent search suggestions</p>
			</div>

			<div class="feature">
				<span class="icon">📱</span>
				<h3>Mobile Friendly</h3>
				<p>Access your recipes anywhere, anytime with our responsive design</p>
			</div>
		</div>
	</section>

	<section class="mission">
		<h2>Our Mission</h2>
		<p>
			At Forkly, we believe that cooking should be accessible, enjoyable, and healthy. Our platform is
			designed to help home cooks create, organize, and understand the nutritional value of their
			recipes.
		</p>
	</section>
</div>

<style lang="scss">
	.about-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--spacing-lg) var(--spacing-md);
	}

	.hero {
		text-align: center;
		margin-bottom: var(--spacing-2xl);

		h1 {
			font-size: calc(var(--spacing-xl) * 1.5);
			margin-bottom: var(--spacing-md);
		}

		.tagline {
			font-size: var(--spacing-lg);
			color: var(--color-neutral);
		}
	}

	section {
		margin-bottom: var(--spacing-2xl);

		h2 {
			font-size: var(--spacing-xl);
			margin-bottom: var(--spacing-lg);
			text-align: center;
		}
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg);
	}

	.feature {
		background: var(--color-neutral-dark);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-lg);
		text-align: center;
		transition: transform var(--transition-fast) var(--ease-in-out);

		&:hover {
			transform: translateY(calc(var(--spacing-xs) * -1));
		}

		.icon {
			font-size: calc(var(--spacing-xl) * 1.25);
			margin-bottom: var(--spacing-md);
			display: block;
		}

		h3 {
			font-size: var(--spacing-lg);
			margin-bottom: var(--spacing-md);
		}

		p {
			color: var(--color-neutral);
			line-height: 1.5;
		}
	}

	.mission {
		background: var(--color-neutral-dark);
		padding: var(--spacing-xl);
		border-radius: var(--border-radius-lg);
		text-align: center;

		p {
			max-width: 800px;
			margin: 0 auto;
			line-height: 1.6;
			font-size: var(--spacing-md);
			color: var(--color-neutral);
		}
	}

	@media (max-width: 768px) {
		.hero {
			h1 {
				font-size: calc(var(--spacing-xl) * 1.25);
			}
		}

		.feature-grid {
			grid-template-columns: 1fr;
		}

		.mission {
			padding: var(--spacing-lg);
		}
	}
</style> 