<script setup lang="ts">
import * as d3 from "d3";
import { ref, onMounted } from "vue";
import { useResizeObserver } from "@/utilities/resize-observer";
import type { RealtimeDataPoint } from "@/interfaces/ChartRegistry";

const props = defineProps<{
  dataPoint: number;
  yAxisRange: number[];
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

  let data: Array<RealtimeDataPoint> = [];

  const g = svg
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

  // Time (x-axis) scale
  const timeScale = d3.scaleTime().range([0, width]);

  // Linear (y-axis) scale
  const valueScale = d3.scaleLinear().domain(props.yAxisRange).range([height, 0]);

  // Construct line generator
  const line = d3
    .line()
    .curve(d3.curveBasis)
    .x((d: any) => timeScale(d.time))
    .y((d: any) => valueScale(d.value));

  // Time scale along x-axis
  const xAxis = d3
    .axisBottom(timeScale)
    .tickSizeInner(-height)
    .tickSizeOuter(0)
    .tickPadding(10);

  // x-axis call for later update
  const axisCall = g
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "x axis");

  axisCall.call(xAxis);

  // Linear scale along y-axis
  g.append("g")
    .attr("class", "y axis axis--y")
    .call(
      d3
        .axisLeft(valueScale)
        .tickSizeInner(-width)
        .tickSizeOuter(0)
        .tickPadding(10)
    );

  // Append paths
  const gpaths = g
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

    if (data.length > 200) {
      console.log("graph data cleared");
      data = data.slice(1).slice(-100);
    }

    // Shift domain
    timeScale.domain([now - (limit - 2) * duration, now - duration]);

    axisCall.transition().duration(duration).ease(d3.easeLinear).call(xAxis);

    const gline = gpaths
      .selectAll<SVGGElement, RealtimeDataPoint>(".gline")
      .data([data]);

    const genter = gline
      .enter()
      .append("g")
      .attr("class", "gline")
      .merge(gline);

    const gsvg = genter
      .selectAll<SVGPathElement, RealtimeDataPoint>("path")
      .data((dp) => [dp]);

    gsvg
      .enter()
      .append("path")
      .attr("class", "line")
      .style("stroke", "#ff906b")
      .style("stroke-width", "2")
      .style("fill", "none")
      .merge(gsvg)
      .transition()
      .duration(duration)
      .ease(d3.easeLinear)
      .attr("d", line(<Iterable<[number, number]>>data))
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
  height: 300px;
  width: 100%;
}
</style>
