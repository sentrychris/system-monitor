<script setup lang="ts">
import * as d3 from "d3";
import { ref, onMounted } from "vue";
import { useResizeObserver } from "@/utilities/resize-observer";
import type { DataPoint } from "@/interfaces/RealtimeChart";

const props = defineProps<{
  metric: 'cpu' | 'mem' | 'disk';
  track: 'temp' | 'usage' | 'percent' | 'used' | 'free' | 'total'; 
}>()

const svgRef = ref(null);
const currentDataPoint = ref(0);
const { resizeRef, resizeState } = useResizeObserver();

let connection: WebSocket | null = null;
const connect = async () => {
  const client = await fetch('http://192.168.1.100:4200', {
    method: 'POST',
    //@ts-ignore
    body:  { connection: 'monitor' }
  })

  const worker = await client.json()
  const url = `ws://192.168.1.100:4200/ws?id=${worker.id}`
  
  connection = connection ?? new WebSocket(url)
  connection.onopen = () => {
    draw()
  }
  connection.onmessage = (response) => {
    try {
      const data: any = JSON.parse(response.data)
      if (data[props.metric] && Object.prototype.hasOwnProperty.call(data[props.metric], props.track)) {
        currentDataPoint.value = data[props.metric][props.track]
      }
    } catch (error) {}
  }
  connection.onclose = () => {
    connection = null
  }
}

const draw = () => {
  const svg = d3.select(svgRef.value);
  
  const margin = {top: 50, bottom: 50, left: 50, right: 50};
  const width = resizeState.dimensions.width - margin.left - margin.right;
  const height = resizeState.dimensions.height - margin.top - margin.bottom;
  
  const limit = 60;
  const duration = 500;
  
  let data: DataPoint[] = [];
  
  let g = svg.append('g')
  .attr('transform', `translate( ${margin.left}, ${margin.top} )`);
  
  g.append('defs').append('clipPath')
  .attr('id', 'clip2')
  .append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', width)
  .attr('height', height);
  
  // Parse time scale
  const timeScale = d3.scaleTime()
  .range([0, width])
  
  // Linear scale (0 to 100)
  const valueScale = d3.scaleLinear()
  .domain([0, 100])
  .range([height, 0]);
  
  // Construct line generator
  const line = d3.line().curve(d3.curveBasis)
  .x((d: any) => timeScale(d.time))
  .y((d: any) => valueScale(d.value));
  
  // Time scale along x-axis
  const xAxis = d3.axisBottom(timeScale);
  const axisCall = g.append('g')
  .attr('transform', `translate(0, ${height})`);
  axisCall.call(xAxis);
  
  // Linear scale along y-axis
  g.append('g')
  .attr('class', 'axis axis--y')
  .call(d3.axisLeft(valueScale))
  
  // Append paths
  let gpaths = g.append('g')
  .attr('id', 'paths')
  .attr('class', 'paths')
  .attr('clip-path', 'url(#clip2)');
  
  // Update chart
  const update = () => {
    let now = Date.now();
    data.push({
      time: now,
      value: currentDataPoint.value
    });
    
    // Shift domain
    timeScale.domain([now - ((limit - 2) * duration), now - duration]);
    
    axisCall.transition()
    .duration(duration)
    .ease(d3.easeLinear)
    .call(xAxis);
    
    let gline = gpaths.selectAll('.gline')
    .data([data]);
    
    let genter = gline.enter()
    .append('g')
    .attr('class', 'gline')
    // @ts-ignore
    .merge(gline);
    
    let gsvg = genter.selectAll('path')
    .data((dp) => [dp]);
    
    gsvg.enter()
    .append('path').attr('class', 'line')
    .style('stroke', '#D073BA')
    .style('fill', 'none')
    // @ts-ignore
    .merge(gsvg)
    .transition()
    .duration(duration)
    // @ts-ignore
    .ease(d3.easeLinear, 2)
    // @ts-ignore
    .attr('d', line(data))
    .attr('transform', null);
  }
  
  setInterval(update, duration);
}

onMounted(() => {
  connect()
})
</script>

<template>
  <div ref="resizeRef">
    <svg width="800" height="300" ref="svgRef">
    </svg>
  </div>
</template>