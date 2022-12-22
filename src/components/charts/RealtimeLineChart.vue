<script setup lang="ts">
import * as d3 from "d3";
import { ref, onMounted } from "vue";
import { useResizeObserver } from "@/utilities/resize-observer";
import type { DataPoint } from "@/interfaces/RealtimeChart";

const props = defineProps<{
  dataPoint: number;
  yRange: number[];
}>();

const svgRef = ref(null);
const { resizeRef, resizeState } = useResizeObserver();

const draw = () => {
  const svg = d3.select(svgRef.value);

  const margin = { top: 50, bottom: 50, left: 50, right: 50 };
  const width = resizeState.dimensions.width - margin.left - margin.right;
  const height = resizeState.dimensions.height - margin.top - margin.bottom;

  const limit = 60;
  const duration = 500;

  let data: DataPoint[] = [];

  let g = svg
    .append("g")
    .attr("transform", `translate( ${margin.left}, ${margin.top} )`);

  g.append("defs")
    .append("clipPath")
    .attr("id", "clip2")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);

  // Parse time scale
  const timeScale = d3.scaleTime().range([0, width]);

  // Linear scale
  const valueScale = d3.scaleLinear().domain(props.yRange).range([height, 0]);

  // Construct line generator
  const line = d3
    .line()
    .curve(d3.curveBasis)
    .x((d: any) => timeScale(d.time))
    .y((d: any) => valueScale(d.value));

  // Time scale along x-axis
  const xAxis = d3.axisBottom(timeScale);
  const axisCall = g.append("g").attr("transform", `translate(0, ${height})`);
  axisCall.call(xAxis);

  // Linear scale along y-axis
  g.append("g").attr("class", "axis axis--y").call(d3.axisLeft(valueScale));

  // Append paths
  let gpaths = g
    .append("g")
    .attr("id", "paths")
    .attr("class", "paths")
    .attr("clip-path", "url(#clip2)");

  // Update chart
  const update = () => {
    let now = Date.now();
    data.push({
      time: now,
      value: props.dataPoint,
    });

    // Shift domain
    timeScale.domain([now - (limit - 2) * duration, now - duration]);

    axisCall.transition().duration(duration).ease(d3.easeLinear).call(xAxis);

    let gline = gpaths.selectAll(".gline").data([data]);

    let genter = gline
      .enter()
      .append("g")
      .attr("class", "gline")
      // @ts-ignore
      .merge(gline);

    let gsvg = genter.selectAll("path").data((dp) => [dp]);

    gsvg
      .enter()
      .append("path")
      .attr("class", "line")
      .style("stroke", "#D073BA")
      .style("fill", "none")
      // @ts-ignore
      .merge(gsvg)
      .transition()
      .duration(duration)
      // @ts-ignore
      .ease(d3.easeLinear, 2)
      // @ts-ignore
      .attr("d", line(data))
      .attr("transform", null);
  };

  setInterval(update, duration);
};

onMounted(() => {
  draw();
});
</script>

<template>
  <div class="realtime-line-wrapper" ref="resizeRef">
    <svg ref="svgRef"></svg>
  </div>
</template>

<style scoped>
.realtime-line-wrapper svg {
  height: 200px;
  width: 100%;
}
</style>
