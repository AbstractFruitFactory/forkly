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
		padding: 2rem 1rem;
	}

	.hero {
		text-align: center;
		margin-bottom: 4rem;

		h1 {
			font-size: 3rem;
			margin-bottom: 1rem;
		}

		.tagline {
			font-size: 1.25rem;
			color: var(--color-neutral);
		}
	}

	section {
		margin-bottom: 4rem;

		h2 {
			font-size: 2rem;
			margin-bottom: 2rem;
			text-align: center;
		}
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.feature {
		background: var(--color-neutral-dark);
		padding: 2rem;
		border-radius: 8px;
		text-align: center;
		transition: transform 0.2s ease;

		&:hover {
			transform: translateY(-4px);
		}

		.icon {
			font-size: 2.5rem;
			margin-bottom: 1rem;
			display: block;
		}

		h3 {
			font-size: 1.25rem;
			margin-bottom: 1rem;
		}

		p {
			color: var(--color-neutral);
			line-height: 1.5;
		}
	}

	.mission {
		background: var(--color-neutral-dark);
		padding: 3rem;
		border-radius: 8px;
		text-align: center;

		p {
			max-width: 800px;
			margin: 0 auto;
			line-height: 1.6;
			font-size: 1.1rem;
			color: var(--color-neutral);
		}
	}

	@media (max-width: 768px) {
		.hero {
			h1 {
				font-size: 2.5rem;
			}
		}

		.feature-grid {
			grid-template-columns: 1fr;
		}

		.mission {
			padding: 2rem;
		}
	}
</style> 