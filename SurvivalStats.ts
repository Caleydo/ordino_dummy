/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
/// <reference path='../../tsd.d.ts' />

/// <amd-dependency path='css!./style' />
import ajax = require('../caleydo_core/ajax');
import {AView, IViewContext, ISelection} from '../targid2/View';
import {alteration_types} from './Configs';

export class SurvivalStats extends AView {

  private x = d3.scale.linear();
  private y = d3.scale.linear();
  private xAxis = d3.svg.axis().orient('bottom').scale(this.x);

  private parameter = {
    alteration_type: alteration_types[0]
  };

  private line = d3.svg.line().interpolate('step')
      .x((d) => this.x(d[0]))
      .y((d) => this.y(d[1]));

  constructor(context:IViewContext, private selection:ISelection, parent:Element, options?) {
    super(context, parent, options);
    this.$node.classed('survival-stats', true);

    this.build();
    this.update();
  }

  private build() {
    const margin = {top: 10, right: 10, bottom: 30, left: 10},
      width = 300 - margin.left - margin.right,
      height = 320 - margin.top - margin.bottom;

    var svg = this.$node.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.x.range([0, width]);
    this.y.range([0, height]);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')');
  }

  private updateChart(rows_yes: number[], rows_no: number[]) {
    this.x.domain([0, d3.max(rows_yes.concat(rows_no))]);

    this.updateKM(this.$node, [rows_yes, rows_no]);
  }

  private updateKM($parent: d3.Selection<any>, rows: number[][]) {
    const svg = $parent.select('svg g');

    svg.select('g.x.axis').call(this.xAxis);


    this.y.domain([0, 1]);
    const toPoints = (row: number[]) => {
      const died = row.filter((a) => !isNaN(a)).map((a) => Math.abs(a));
      died.sort(d3.ascending);
      const l = row.length;
      //const alive = arr.length - died.length;

      //0 ... 100%
      var points = [[0, 0]],
        prev_i = 0;
      for (let i = 1; i < died.length; ++i) {
        while(died[i] === died[i-1] && i < died.length) {
          ++i;
        }
        points.push([died[prev_i], (prev_i + 1)/l]);
        prev_i = i;
      }
      if (died.length > 0) {
        points.push([died[prev_i], (prev_i + 1)/l]);
      }
      points.push([this.x.domain()[1], died.length/l]);
      return points;
    };
    const points = rows.map(toPoints);
    const $points = svg.selectAll('path.km').data(points);
    $points.enter().append('path').classed('km', true).append('title');
    $points.attr('d', this.line).classed('having',(d,i)=>i === 0);
    $points.select('title').text((d,i) => i === 0 ? 'Having Alteration Type': 'Not Having Alteration Type');
    $points.exit().remove();
  }

  buildParameterUI($parent: d3.Selection<any>, onChange: (name: string, value: any)=>Promise<any>) {
    $parent.append('span').text('alteration type ');
    const $select = $parent.append('select').attr({
      'class': 'form-control',
      required: 'required'
    }).on('change', function() {
      onChange('alteration_type', alteration_types[this.selectedIndex]);
    });
    $select.selectAll('option').data(alteration_types)
      .enter().append('option').text(String).attr('value', String);
    $select.property('selectedIndex', alteration_types.indexOf(this.parameter.alteration_type));
  }

  getParameter(name: string): any {
    return this.parameter[name];
  }

  setParameter(name: string, value: any) {
    this.parameter[name] = value;
    return this.update();
  }

  changeSelection(selection:ISelection) {
    this.selection = selection;
    return this.update();
  }

  private update() {
    const id = this.selection.range.first;
    const idtype = this.selection.idtype;
    this.setBusy(true);
    return this.resolveId(idtype, id, 'IDTypeA').then((name) => {
      return ajax.getAPIJSON('/targid/db/dummy/survival_stats', {
        a_id: name
      });
    }).then((rows) => {
      const yes = rows.filter((d) => d.ab_cat === this.parameter.alteration_type);
      const no = rows.filter((d) => d.ab_cat !== this.parameter.alteration_type);
      this.updateChart(yes.map((d) => d.b_int), no.map((d) => d.b_int));
      this.setBusy(false);
    });
  }
}


export function create(context:IViewContext, selection:ISelection, parent:Element, options?) {
  return new SurvivalStats(context, selection, parent, options);
}


