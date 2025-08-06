<div class="terms-container">
	<div class="terms-content">
		<header class="terms-header">
			<h1 class="terms-title">📜 Terms of Use</h1>
			<p class="effective-date">Effective Date: August 6, 2025</p>
		</header>

		<div class="terms-body">
			<p class="welcome-text">
				Welcome to Forkly! By using this website, you agree to the following terms:
			</p>

			<section class="terms-section">
				<h2 class="section-title">1. Use of the Site</h2>
				<ul class="section-list">
					<li>You may submit, view, and share recipes.</li>
					<li>You're responsible for the content you post.</li>
					<li>Don't post anything illegal, hateful, or harmful.</li>
					<li>We may remove content that violates these terms.</li>
				</ul>
			</section>

			<section class="terms-section">
				<h2 class="section-title">2. Accounts</h2>
				<ul class="section-list">
					<li>Some features may require an account.</li>
					<li>You're responsible for keeping your login info safe.</li>
					<li>We may suspend accounts for abuse or spam.</li>
				</ul>
			</section>

			<section class="terms-section">
				<h2 class="section-title">3. Content Ownership</h2>
				<ul class="section-list">
					<li>You retain rights to any recipes or content you submit.</li>
					<li>
						By posting, you give Forkly permission to display and share your content publicly.
					</li>
					<li>Don't post copyrighted content you don't own.</li>
				</ul>
			</section>

			<section class="terms-section">
				<h2 class="section-title">4. Disclaimer</h2>
				<ul class="section-list">
					<li>Forkly is provided "as is" with no guarantees.</li>
					<li>We try to keep the site up and bug-free, but things might break.</li>
				</ul>
			</section>

			<section class="terms-section">
				<h2 class="section-title">5. Changes</h2>
				<ul class="section-list">
					<li>We may update these terms occasionally.</li>
					<li>Continued use means you agree to the latest version.</li>
				</ul>
			</section>
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.terms-container {
		background: var(--color-background);
		padding: var(--spacing-xl) var(--spacing-lg);
	}

	.terms-content {
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

	.terms-header {
		text-align: center;
		margin-bottom: var(--spacing-2xl);
		padding-bottom: var(--spacing-xl);
		border-bottom: 2px solid var(--color-border);
	}

	.terms-title {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		color: var(--color-text-on-surface);
		margin: 0 0 var(--spacing-md) 0;

		@include mobile {
			font-size: var(--font-size-2xl);
		}
	}

	.effective-date {
		font-size: var(--font-size-md);
		color: var(--color-text-on-surface);
		opacity: 0.7;
		margin: 0;
		font-weight: 500;
	}

	.terms-body {
		line-height: 1.6;
	}

	.welcome-text {
		font-size: var(--font-size-lg);
		color: var(--color-text-on-surface);
		margin-bottom: var(--spacing-2xl);
		font-weight: 500;
	}

	.terms-section {
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
		border-left: 4px solid var(--color-primary);
		padding-left: var(--spacing-md);

		@include mobile {
			font-size: var(--font-size-lg);
		}
	}

	.section-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.section-list li {
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
</style>
