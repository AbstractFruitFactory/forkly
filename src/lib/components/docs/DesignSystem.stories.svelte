<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf'

  const { Story } = defineMeta({
    title: 'Design System',
    tags: ['!autodocs']
  })
</script>

<Story name="Overview">
  <div class="docs-container">
    <header class="docs-header">
      <h1>Design System</h1>
      <p class="subtitle">A comprehensive guide to Forkly's design language</p>
    </header>
    
    <section class="section-container">
      <div class="section-header">
        <h2>Logo</h2>
        <p class="section-description">Our brand identity starts with our distinctive logo</p>
      </div>
      <div class="logo-showcase">
        <div class="logo-display">
          <div class="logo-example">
            <span class="logo-text">Forkly</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section-container">
      <div class="section-header">
        <h2>Colors</h2>
        <p class="section-description">Our color system is designed to create a cohesive and accessible user experience</p>
      </div>
      <div class="color-grid">
        <div class="color-item" style="background: var(--color-primary)">
          <div class="color-info">
            <span class="color-name">Primary</span>
          </div>
        </div>
        <div class="color-item" style="background: var(--color-primary-light)">
          <div class="color-info">
            <span class="color-name">Primary Light</span>
          </div>
        </div>
        <div class="color-item" style="background: var(--color-primary-dark)">
          <div class="color-info">
            <span class="color-name">Primary Dark</span>
          </div>
        </div>
        <div class="color-item" style="background: var(--color-secondary)">
          <div class="color-info">
            <span class="color-name">Secondary</span>
          </div>
        </div>
        <div class="color-item" style="background: var(--color-background)">
          <div class="color-info">
            <span class="color-name">Background</span>
          </div>
        </div>
        <div class="color-item" style="background: var(--color-neutral)">
          <div class="color-info">
            <span class="color-name">Neutral</span>
          </div>
        </div>
        <div class="color-item" style="background: var(--color-success)">
          <div class="color-info">
            <span class="color-name">Success</span>
          </div>
        </div>
        <div class="color-item" style="background: var(--color-error)">
          <div class="color-info">
            <span class="color-name">Error</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section-container">
      <div class="section-header">
        <h2>Typography</h2>
        <p class="section-description">A type system that establishes a clear visual hierarchy</p>
      </div>
      <div class="typography-showcase">
        <div class="type-item">
          <h1>Heading 1</h1>
          <span class="type-meta">3XL</span>
        </div>
        <div class="type-item">
          <h2>Heading 2</h2>
          <span class="type-meta">2XL</span>
        </div>
        <div class="type-item">
          <h3>Heading 3</h3>
          <span class="type-meta">XL</span>
        </div>
        <div class="type-item">
          <h4>Heading 4</h4>
          <span class="type-meta">LG</span>
        </div>
        <div class="type-item">
          <h5>Heading 5</h5>
          <span class="type-meta">Base</span>
        </div>
        <div class="type-item">
          <h6>Heading 6</h6>
          <span class="type-meta">Base</span>
        </div>
        <div class="type-item">
          <p>Body text with standard line height</p>
          <span class="type-meta">Base</span>
        </div>
        <div class="type-item">
          <p class="font-serif">Serif Text</p>
          <span class="type-meta">Base</span>
        </div>
        <div class="type-item">
          <code>Monospace Text</code>
          <span class="type-meta">Base</span>
        </div>

        <h3 class="type-section-title">Text Sizes</h3>
        <div class="type-item">
          <p class="text-xs">Extra Small</p>
          <span class="type-meta">XS</span>
        </div>
        <div class="type-item">
          <p class="text-sm">Small</p>
          <span class="type-meta">SM</span>
        </div>
        <div class="type-item">
          <p class="text-base">Base</p>
          <span class="type-meta">Base</span>
        </div>
        <div class="type-item">
          <p class="text-lg">Large</p>
          <span class="type-meta">LG</span>
        </div>
        <div class="type-item">
          <p class="text-xl">Extra Large</p>
          <span class="type-meta">XL</span>
        </div>
        <div class="type-item">
          <p class="text-2xl">2X Large</p>
          <span class="type-meta">2XL</span>
        </div>
        <div class="type-item">
          <p class="text-3xl">3X Large</p>
          <span class="type-meta">3XL</span>
        </div>
      </div>
    </section>

    <section class="section-container">
      <div class="section-header">
        <h2>Spacing</h2>
        <p class="section-description">Fibonacci-based spacing system for consistent layouts</p>
      </div>
      <div class="spacing-showcase">
        <div class="spacing-row">
          <div class="spacing-item" style="width: var(--spacing-xs)"></div>
          <span class="spacing-label">Extra Small</span>
        </div>
        <div class="spacing-row">
          <div class="spacing-item" style="width: var(--spacing-sm)"></div>
          <span class="spacing-label">Small</span>
        </div>
        <div class="spacing-row">
          <div class="spacing-item" style="width: var(--spacing-md)"></div>
          <span class="spacing-label">Medium</span>
        </div>
        <div class="spacing-row">
          <div class="spacing-item" style="width: var(--spacing-lg)"></div>
          <span class="spacing-label">Large</span>
        </div>
        <div class="spacing-row">
          <div class="spacing-item" style="width: var(--spacing-xl)"></div>
          <span class="spacing-label">Extra Large</span>
        </div>
        <div class="spacing-row">
          <div class="spacing-item" style="width: var(--spacing-2xl)"></div>
          <span class="spacing-label">2X Large</span>
        </div>
      </div>
    </section>

    <section class="section-container">
      <div class="section-header">
        <h2>Shadows</h2>
        <p class="section-description">Elevation system to create depth and hierarchy</p>
      </div>
      <div class="shadow-grid">
        <div class="shadow-item" style="box-shadow: var(--shadow-sm)">
          <span class="shadow-label">Small</span>
        </div>
        <div class="shadow-item" style="box-shadow: var(--shadow-md)">
          <span class="shadow-label">Medium</span>
        </div>
        <div class="shadow-item" style="box-shadow: var(--shadow-lg)">
          <span class="shadow-label">Large</span>
        </div>
        <div class="shadow-item" style="box-shadow: var(--shadow-inner)">
          <span class="shadow-label">Inner</span>
        </div>
      </div>
    </section>

    <section class="section-container">
      <div class="section-header">
        <h2>Border Radius</h2>
        <p class="section-description">Consistent rounding for UI elements</p>
      </div>
      <div class="border-radius-showcase">
        <div class="border-radius-item" style="border-radius: var(--border-radius-sm)">
          <span class="radius-label">Small</span>
          <code class="radius-value">Small</code>
        </div>
        <div class="border-radius-item" style="border-radius: var(--border-radius-md)">
          <span class="radius-label">Medium</span>
          <code class="radius-value">Medium</code>
        </div>
        <div class="border-radius-item" style="border-radius: var(--border-radius-lg)">
          <span class="radius-label">Large</span>
          <code class="radius-value">Large</code>
        </div>
        <div class="border-radius-item" style="border-radius: var(--border-radius-xl)">
          <span class="radius-label">Extra Large</span>
          <code class="radius-value">Extra Large</code>
        </div>
        <div class="border-radius-item" style="border-radius: var(--border-radius-2xl)">
          <span class="radius-label">2X Large</span>
          <code class="radius-value">2X Large</code>
        </div>
        <div class="border-radius-item" style="border-radius: var(--border-radius-full)">
          <span class="radius-label">Full</span>
          <code class="radius-value">Full</code>
        </div>
      </div>
    </section>

    <section class="section-container">
      <div class="section-header">
        <h2>Transitions</h2>
        <p class="section-description">Smooth animations for interactive elements</p>
      </div>
      <div class="transitions-showcase">
        <div class="transition-group">
          <h3>Duration</h3>
          <div class="transition-items">
            <div class="transition-item" style="transition-duration: var(--transition-fast)">
              <div class="transition-demo"></div>
              <div class="transition-meta">
                <span>Fast</span>
              </div>
            </div>
            <div class="transition-item" style="transition-duration: var(--transition-normal)">
              <div class="transition-demo"></div>
              <div class="transition-meta">
                <span>Normal</span>
              </div>
            </div>
            <div class="transition-item" style="transition-duration: var(--transition-slow)">
              <div class="transition-demo"></div>
              <div class="transition-meta">
                <span>Slow</span>
              </div>
            </div>
          </div>
        </div>
        <div class="transition-group">
          <h3>Easing</h3>
          <div class="transition-items">
            <div class="transition-item" style="transition-timing-function: var(--ease-in-out)">
              <div class="transition-demo"></div>
              <div class="transition-meta">
                <span>Ease In Out</span>
              </div>
            </div>
            <div class="transition-item" style="transition-timing-function: var(--ease-in)">
              <div class="transition-demo"></div>
              <div class="transition-meta">
                <span>Ease In</span>
              </div>
            </div>
            <div class="transition-item" style="transition-timing-function: var(--ease-out)">
              <div class="transition-demo"></div>
              <div class="transition-meta">
                <span>Ease Out</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</Story>

<style lang="scss">
  :global(body) {
    background-color: var(--color-background);
  }

  .docs-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-xl);
    color: white;
  }

  .docs-header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
    
    h1 {
      font-size: var(--font-size-3xl);
      margin-bottom: var(--spacing-md);
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: var(--font-size-xl);
      color: var(--color-neutral-light);
    }
  }

  .section-container {
    margin-bottom: var(--spacing-3xl);
    padding: var(--spacing-xl);
    background: var(--color-neutral-dark);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
  }

  .section-header {
    margin-bottom: var(--spacing-xl);
    
    h2 {
      font-size: var(--font-size-2xl);
      margin-bottom: var(--spacing-sm);
      color: var(--color-primary-light);
    }

    .section-description {
      color: var(--color-neutral-light);
      font-size: var(--font-size-lg);
    }
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .color-item {
    height: 160px;
    border-radius: var(--border-radius-lg);
    position: relative;
    transition: transform var(--transition-fast) var(--ease-out);
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
    }

    .color-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: var(--spacing-md);
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
      
      .color-name {
        display: block;
        font-weight: 500;
      }
    }
  }

  .typography-showcase {
    display: grid;
    gap: var(--spacing-xl);
  }

  .type-item {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-neutral);

    .type-meta {
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      color: var(--color-neutral-light);
    }
  }

  .type-section-title {
    font-size: var(--font-size-xl);
    color: var(--color-primary-light);
    margin: var(--spacing-2xl) 0 var(--spacing-lg);
  }

  .spacing-showcase {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    background: var(--color-neutral-dark);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-lg);
  }

  .spacing-row {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
    min-height: 32px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      border-bottom: 1px dashed var(--color-neutral);
      z-index: 0;
    }
  }

  .spacing-item {
    height: 32px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    border-radius: var(--border-radius-sm);
    position: relative;
    z-index: 1;
  }

  .spacing-label {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--color-neutral-light);
    background: var(--color-neutral-dark);
    padding: 0 var(--spacing-sm);
    position: relative;
    z-index: 1;
    min-width: 100px;
  }

  .shadow-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-xl);
    padding: var(--spacing-xl);
    background: var(--color-neutral);
    border-radius: var(--border-radius-lg);
  }

  .shadow-item {
    background: var(--color-neutral-light);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-lg);
    height: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    transition: all var(--transition-fast) var(--ease-out);
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
    }

    .shadow-label {
      font-weight: 500;
      font-size: var(--font-size-lg);
      color: var(--color-neutral-dark);
    }
  }

  .border-radius-showcase {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-lg);
  }

  .border-radius-item {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    transition: transform var(--transition-fast) var(--ease-out);
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
    }

    .radius-label {
      font-weight: 500;
    }

    .radius-value {
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      opacity: 0.8;
    }
  }

  .transitions-showcase {
    display: grid;
    gap: var(--spacing-2xl);
  }

  .transition-group {
    h3 {
      margin-bottom: var(--spacing-lg);
      color: var(--color-primary-light);
      font-size: var(--font-size-xl);
    }
  }

  .transition-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-xl);
  }

  .transition-item {
    background: var(--color-neutral-dark);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, 
        var(--color-primary) 0%,
        var(--color-secondary) 50%,
        var(--color-primary) 100%
      );
      transform: translateX(-100%);
    }

    &[style*="var(--transition-fast)"]::before {
      animation: loading calc(var(--transition-fast) * 10) infinite;
    }

    &[style*="var(--transition-normal)"]::before {
      animation: loading calc(var(--transition-normal) * 10) infinite;
    }

    &[style*="var(--transition-slow)"]::before {
      animation: loading calc(var(--transition-slow) * 10) infinite;
    }

    &[style*="var(--ease-in-out)"]::before {
      animation: loading 2s infinite var(--ease-in-out);
    }

    &[style*="var(--ease-in)"]::before {
      animation: loading 2s infinite var(--ease-in);
    }

    &[style*="var(--ease-out)"]::before {
      animation: loading 2s infinite var(--ease-out);
    }

    .transition-demo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      border-radius: var(--border-radius-md);
      position: relative;
    }

    &[style*="transition-duration"] .transition-demo::after {
      content: '↻';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: var(--font-size-xl);
      color: white;
    }

    &[style*="var(--transition-fast)"] .transition-demo {
      animation: rotate calc(var(--transition-fast) * 10) infinite;
    }

    &[style*="var(--transition-normal)"] .transition-demo {
      animation: rotate calc(var(--transition-normal) * 10) infinite;
    }

    &[style*="var(--transition-slow)"] .transition-demo {
      animation: rotate calc(var(--transition-slow) * 10) infinite;
    }

    &[style*="var(--ease-in-out)"] .transition-demo {
      animation: bounce 2s infinite var(--ease-in-out);
    }

    &[style*="var(--ease-in)"] .transition-demo {
      animation: bounce 2s infinite var(--ease-in);
    }

    &[style*="var(--ease-out)"] .transition-demo {
      animation: bounce 2s infinite var(--ease-out);
    }

    .transition-meta {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xs);
    }
  }

  @keyframes loading {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0); }
    100% { transform: translateX(100%); }
  }

  @keyframes rotate {
    0% { transform: rotate(0deg); }
    50% { transform: rotate(180deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes bounce {
    0% { transform: translateY(0); }
    100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  .logo-showcase {
    background: var(--color-neutral-dark);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-lg);
  }

  .logo-display {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    align-items: center;
  }

  .logo-example {
    padding: var(--spacing-xl);
    background: var(--color-background);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
  }

  .logo-text {
    font-family: 'Pacifico', cursive;
    font-size: var(--font-size-3xl);
    color: var(--color-primary);
  }

  code {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-background);
    border-radius: var(--border-radius-sm);
  }
</style> 