<div class="privacy-container">
	<div class="privacy-content">
		<header class="privacy-header">
			<h1 class="privacy-title">🔐 Privacy Policy</h1>
			<p class="effective-date">Effective Date: January 1, 2025</p>
		</header>

		<div class="privacy-body">
			<p class="welcome-text">
				Your privacy is important to us. Here's how we handle your data:
			</p>

			<section class="privacy-section">
				<h2 class="section-title">1. What We Collect</h2>
				<ul class="section-list">
					<li>If you sign up: your email, username, and basic profile info.</li>
					<li>If you post recipes: the content you share.</li>
					<li>Automatically: basic analytics (like pages visited or browser type).</li>
				</ul>
			</section>

			<section class="privacy-section">
				<h2 class="section-title">2. How We Use It</h2>
				<ul class="section-list">
					<li>To operate and improve Forkly.</li>
					<li>To show and manage user-generated content.</li>
					<li>To communicate with you (if you've signed up).</li>
				</ul>
			</section>

			<section class="privacy-section">
				<h2 class="section-title">3. Cookies</h2>
				<p class="section-intro">We use cookies for:</p>
				<ul class="section-list">
					<li>Keeping you logged in</li>
					<li>Remembering preferences</li>
					<li>Measuring site usage (analytics)</li>
				</ul>
				<p class="section-note">
					You can block cookies in your browser, but some features may not work.
				</p>
			</section>

			<section class="privacy-section">
				<h2 class="section-title">4. Third Parties</h2>
				<p class="section-intro">We may use third-party tools like:</p>
				<ul class="section-list">
					<li>Resend for sending email</li>
					<li>Plausible/PostHog/etc. for analytics</li>
				</ul>
				<p class="section-note">These services may collect anonymized data.</p>
				<p class="section-highlight">We don't sell your data. Ever.</p>
			</section>

			<section class="privacy-section">
				<h2 class="section-title">5. Your Rights</h2>
				<ul class="section-list">
					<li>
						You can request to delete your account or data anytime:{' '}
						<a href="mailto:hello@forkly.me" class="contact-link">hello@forkly.me</a>
					</li>
					<li>You can contact us with any concerns.</li>
				</ul>
			</section>
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.privacy-container {
		background: var(--color-background);
		padding: var(--spacing-xl) var(--spacing-lg);
	}

	.privacy-content {
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

	.privacy-header {
		text-align: center;
		margin-bottom: var(--spacing-2xl);
		padding-bottom: var(--spacing-xl);
		border-bottom: 2px solid var(--color-border);
	}

	.privacy-title {
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

	.privacy-body {
		line-height: 1.6;
	}

	.welcome-text {
		font-size: var(--font-size-lg);
		color: var(--color-text-on-surface);
		margin-bottom: var(--spacing-2xl);
		font-weight: 500;
	}

	.privacy-section {
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

	.section-intro {
		font-size: var(--font-size-md);
		color: var(--color-text-on-surface);
		margin: 0 0 var(--spacing-md) 0;
		font-weight: 500;
	}

	.section-list {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--spacing-md) 0;
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

	.section-note {
		font-size: var(--font-size-sm);
		color: var(--color-text-on-surface);
		opacity: 0.8;
		margin: var(--spacing-md) 0 0 0;
		font-style: italic;
	}

	.section-highlight {
		font-size: var(--font-size-md);
		color: var(--color-primary);
		font-weight: 600;
		margin: var(--spacing-md) 0 0 0;
		text-align: center;
		padding: var(--spacing-md);
		background: var(--color-primary-light);
		border-radius: var(--border-radius-lg);
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