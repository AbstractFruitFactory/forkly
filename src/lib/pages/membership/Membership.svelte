<div class="membership-content">
	<header class="membership-header">
		<div class="header-badge">
			<span class="badge-icon">🔒</span>
			<span class="badge-text">Early Access</span>
		</div>
		<h1 class="membership-title">Forkly+ Membership</h1>
		<p class="membership-tagline">Unlock unlimited recipe imports and all future features</p>
		<p class="membership-description">
			Join now to get unlimited imports and all future Forkly+ features for the same price —
			forever.
		</p>
	</header>

	<section class="membership-section">
		<div class="coming-soon-banner">
			<div class="banner-content">
				<div class="banner-icon">🚧</div>
				<h2>Coming Soon</h2>
				<p>We're working hard to bring you Forkly+ membership. Stay tuned!</p>
			</div>
			<div class="banner-decoration"></div>
		</div>
	</section>

	<section class="membership-section">
		<h2 class="section-title">What's Included</h2>
		<div class="features-grid">
			<div class="feature-item">
				<div class="feature-icon-wrapper">
					<span class="feature-icon">📥</span>
				</div>
				<div class="feature-content">
					<h3 class="feature-title">Unlimited Recipe Imports</h3>
					<p class="feature-description">Import as many recipes as you want from any website</p>
				</div>
			</div>
			<div class="feature-item">
				<div class="feature-icon-wrapper">
					<span class="feature-icon">🚀</span>
				</div>
				<div class="feature-content">
					<h3 class="feature-title">Lifetime Access</h3>
					<p class="feature-description">Get all future Forkly+ features without paying more</p>
				</div>
			</div>
			<div class="feature-item">
				<div class="feature-icon-wrapper">
					<span class="feature-icon">💰</span>
				</div>
				<div class="feature-content">
					<h3 class="feature-title">Locked-in Price</h3>
					<p class="feature-description">
						Your monthly price never increases, even as we add more features
					</p>
				</div>
			</div>
			<div class="feature-item">
				<div class="feature-icon-wrapper">
					<span class="feature-icon">❤️</span>
				</div>
				<div class="feature-content">
					<h3 class="feature-title">Support Forkly</h3>
					<p class="feature-description">Help us build the future of recipe sharing</p>
				</div>
			</div>
		</div>
	</section>

	<section class="membership-section">
		<div class="early-access-note">
			<div class="note-icon">⭐</div>
			<div class="note-content">
				<h3 class="note-title">Early Bird Advantage</h3>
				<p class="note-text">We'll be adding more perks to Forkly+ over time.</p>
				<p class="note-text">Early members get everything — without paying more.</p>
			</div>
		</div>
	</section>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.membership-content {
		max-width: 700px;
		margin: 0 auto;
		background: var(--color-surface);
		border-radius: var(--border-radius-xl);
		padding: var(--spacing-xl);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 4px;
			background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		}

		@include mobile {
			padding: var(--spacing-md);
			margin: 0 var(--spacing-sm);
		}
	}

	.membership-header {
		text-align: center;
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-lg);
		border-bottom: 2px solid var(--color-border);
		position: relative;
	}

	.header-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: white;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-full);
		margin-bottom: var(--spacing-md);
		font-weight: 600;
		font-size: var(--font-size-xs);
		box-shadow: 0 4px 12px rgba(239, 86, 26, 0.3);
	}

	.badge-icon {
		font-size: var(--font-size-sm);
	}

	.badge-text {
		color: var(--color-text-on-primary);
	}

	.membership-title {
		font-size: var(--font-size-3xl);
		font-weight: 800;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0 0 var(--spacing-sm) 0;
		line-height: 1.2;

		@include mobile {
			font-size: var(--font-size-2xl);
		}
	}

	.membership-tagline {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-on-surface);
		margin: 0 0 var(--spacing-sm) 0;
	}

	.membership-description {
		font-size: var(--font-size-md);
		color: var(--color-text-on-surface);
		opacity: 0.8;
		margin: 0;
		line-height: 1.5;
		max-width: 500px;
		margin: 0 auto;
	}

	.membership-section {
		margin-bottom: var(--spacing-xl);

		&:last-child {
			margin-bottom: 0;
		}

		&:nth-child(n + 3) {
			opacity: 0.4;
			position: relative;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: rgba(255, 255, 255, 0.1);
				border-radius: var(--border-radius-lg);
				pointer-events: none;
				z-index: 1;
			}

			* {
				position: relative;
				z-index: 2;
			}
		}
	}

	.coming-soon-banner {
		background: linear-gradient(
			135deg,
			var(--color-secondary) 0%,
			var(--color-secondary-light) 100%
		);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		text-align: center;
		margin: var(--spacing-md) 0;
		position: relative;
		overflow: hidden;
		box-shadow: 0 8px 24px rgba(255, 201, 111, 0.3);

		&::before {
			content: '';
			position: absolute;
			top: -50%;
			right: -50%;
			width: 200%;
			height: 200%;
			background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
			animation: float 6s ease-in-out infinite;
		}
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(180deg);
		}
	}

	.banner-content {
		position: relative;
		z-index: 1;
	}

	.banner-icon {
		font-size: var(--font-size-2xl);
		margin-bottom: var(--spacing-sm);
		display: block;
	}

	.coming-soon-banner h2 {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text-on-secondary);
		margin: 0 0 var(--spacing-sm) 0;
	}

	.coming-soon-banner p {
		font-size: var(--font-size-md);
		color: var(--color-text-on-secondary);
		margin: 0;
		opacity: 0.9;
	}

	.section-title {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text-on-surface);
		margin: 0 0 var(--spacing-lg) 0;
		text-align: center;

		@include mobile {
			font-size: var(--font-size-lg);
		}
	}

	.features-grid {
		display: grid;
		gap: var(--spacing-md);
	}

	.feature-item {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%);
		border-radius: var(--border-radius-lg);
		border: 2px solid transparent;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
			border-color: var(--color-primary-light);
		}
	}

	.feature-icon-wrapper {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-sm);
		flex-shrink: 0;
		box-shadow: 0 4px 12px rgba(239, 86, 26, 0.2);
	}

	.feature-icon {
		font-size: var(--font-size-lg);
		display: block;
	}

	.feature-content {
		flex: 1;
	}

	.feature-title {
		font-size: var(--font-size-md);
		font-weight: 600;
		color: var(--color-text-on-surface);
		margin: 0 0 var(--spacing-xs) 0;
	}

	.feature-description {
		font-size: var(--font-size-sm);
		color: var(--color-text-on-surface);
		opacity: 0.8;
		margin: 0;
		line-height: 1.4;
	}

	.early-access-note {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-md);
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		box-shadow: 0 8px 24px rgba(239, 86, 26, 0.3);
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: -50%;
			right: -50%;
			width: 200%;
			height: 200%;
			background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
			animation: float 8s ease-in-out infinite reverse;
		}
	}

	.note-icon {
		font-size: var(--font-size-xl);
		flex-shrink: 0;
		position: relative;
		z-index: 1;
	}

	.note-content {
		flex: 1;
		position: relative;
		z-index: 1;
	}

	.note-title {
		font-size: var(--font-size-md);
		font-weight: 600;
		color: white;
		margin: 0 0 var(--spacing-xs) 0;
	}

	.note-text {
		font-size: var(--font-size-sm);
		color: white;
		margin: 0 0 var(--spacing-xs) 0;
		opacity: 0.9;
		line-height: 1.4;

		&:last-child {
			margin-bottom: 0;
		}
	}
</style>
