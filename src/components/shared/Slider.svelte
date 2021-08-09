<script lang="ts">
  export let onChange;
</script>

<style lang="scss">
  @import "../../style/theme.scss";

  $sliderWidth: 15px;

  .switch {
    position: relative;
    display: inline-block;
    width: $sliderWidth * 2.6;;
    height: $sliderWidth * 1.5;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $accent-light1;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: $sliderWidth;
    width: $sliderWidth;
    left: 4px;
    bottom: 4px;
    background-color: $text;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: $accent-dark1;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #2196f3;
  }

  input:checked + .slider:before {
    transform: translateX($sliderWidth);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>

<label class="switch">
  <input type="checkbox" hidden />
  <span class="slider round" on:change={onChange}/>
</label>
