<script lang="ts">
    export let onClick: () => any
  </script>
  
  <style lang="scss">
    @import "../../style/theme.scss";
  
    div {
      border-radius: 4px;
      background-color: $main;
      width: 130px;
      height: 40px;
      display: flex;
    }
    .btnText {
      align-self: center;
      flex-grow: 1;
      text-align: center;
      margin: 5px;
    }
  </style>
  
  <div on:click="{onClick()}">
      <span class="btnText">
        <slot></slot>
      </span>
  </div>
  