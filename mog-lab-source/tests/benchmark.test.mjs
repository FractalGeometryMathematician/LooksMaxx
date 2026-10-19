import test from 'node:test';import assert from 'node:assert/strict';
import {benchmarkPercentile,ordinal,SAMPLE_COUNT} from '../benchmark.js';
test('synthetic percentile is bounded and monotone',()=>{assert.equal(SAMPLE_COUNT,10000);let previous=0;for(let score=0;score<=100;score++){const p=benchmarkPercentile(score);assert.ok(p>=previous&&p<=100);previous=p}assert.equal(benchmarkPercentile(100),100);assert.throws(()=>benchmarkPercentile(NaN));assert.throws(()=>benchmarkPercentile(101))});
test('percentile suffixes handle teens and ordinary endings',()=>{for(const [n,s] of [[1,'1st'],[2,'2nd'],[3,'3rd'],[11,'11th'],[12,'12th'],[13,'13th'],[21,'21st'],[100,'100th']])assert.equal(ordinal(n),s)});
