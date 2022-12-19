<script lang="ts" setup>
import { onMounted, ref, watchEffect } from "vue";
import {
  select,
  line,
  scaleLinear,
  min,
  max,
  curveBasis,
  axisBottom,
  axisLeft,
type NumberValue,
} from "d3";
import { useResizeObserver } from "@/utilities/resize-observer";

const props = defineProps<{
  data: any;
}>();

const svgRef = ref(null);
const { resizeRef, resizeState } = useResizeObserver();

onMounted(() => {
  // pass ref with DOM element to D3, when mounted (DOM available)
  const svg = select(svgRef.value);
  
  // whenever any dependencies (like data, resizeState) change, call this!
  watchEffect(() => {
    const { width, height } = resizeState.dimensions;
    
    // scales: map index / data values to pixel values on x-axis / y-axis
    const xScale = scaleLinear()
      .domain([0, props.data.length - 1]) // input values...
      .range([0, width]); // ... output values
    
    const yScale = scaleLinear()
      // @ts-ignore
      .domain([min(props.data), max(props.data)]) // input values...
      .range([height, 0]); // ... output values
    
    // line generator: D3 method to transform an array of values to data points ("d") for a path element
    const lineGen = line()
      .curve(curveBasis)
      .x((value, index) => xScale(index))
      .y((value) => yScale((<unknown>value as NumberValue)));
    
    // render path element with D3's General Update Pattern
    svg
      .selectAll(".line") // get all "existing" lines in svg
      .data([props.data]) // sync them with our data
      .join("path") // create a new "path" for new pieces of data (if needed)
      .attr("class", "line") // attach class
      .attr("stroke", "green") // color it
      .attr("d", lineGen); // shape and form of our line
    
    // render axes with help of scales
    // (we let Vue render our axis-containers and let D3 populate the elements inside it)
    const xAxis = axisBottom(xScale);
    const yAxis = axisLeft(yScale);

    if (xAxis && yAxis) {
      svg
      .select(".x-axis")
      .style("transform", `translateY(${height}px)`) // position on the bottom
      // @ts-ignore
      .call(xAxis);
    
      // @ts-ignore
      svg.select(".y-axis").call(yAxis);
    }
  });
});
</script>

<template>
  <div ref="resizeRef">
    <svg class="d3-svg" ref="svgRef">
      <g class="x-axis" />
      <g class="y-axis" />
    </svg>
  </div>
</template>