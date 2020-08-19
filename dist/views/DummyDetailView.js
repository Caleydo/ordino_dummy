/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
import '../scss/main.scss';
import { AD3View } from 'tdp_core';
import { ErrorAlertHandler } from 'tdp_core';
import * as d3 from 'd3';
import { RestBaseUtils } from 'tdp_core';
export class DummyDetailView extends AD3View {
    constructor() {
        super(...arguments);
        this.x = d3.scale.linear();
        this.y = d3.scale.linear();
        this.xAxis = d3.svg.axis().orient('bottom').scale(this.x);
        this.yAxis = d3.svg.axis().orient('left').scale(this.y);
    }
    initImpl() {
        super.initImpl();
        this.$node.classed('dummy-detail', true);
        this.build();
        return this.update();
    }
    build() {
        const margin = { top: 10, right: 30, bottom: 30, left: 30 }, width = 960 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;
        const svg = this.$node.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        this.x.range([0, width]);
        this.y.range([height, 0]);
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')');
        svg.append('g')
            .attr('class', 'y axis');
    }
    updateChart(xlabel, ylabel, rows) {
        this.x.domain(d3.extent(rows, (d) => d.value1));
        this.y.domain(d3.extent(rows, (d) => d.value2));
        const svg = this.$node.select('svg g');
        svg.select('g.x.axis').call(this.xAxis);
        svg.select('g.y.axis').call(this.yAxis);
        const marks = svg.selectAll('.mark').data(rows);
        marks.enter().append('circle').classed('mark', true).attr('r', 5);
        marks.transition().attr({
            cx: (d) => this.x(d.value1),
            cy: (d) => this.y(d.value2),
        });
        marks.exit().remove();
    }
    selectionChanged() {
        super.selectionChanged();
        this.update();
    }
    update() {
        this.setBusy(true);
        let names = null;
        const promise = this.resolveSelection()
            .then((_names) => {
            names = _names;
            return RestBaseUtils.getTDPData('dummy', 'dummy_detail', {
                a_id1: _names[0],
                a_id2: _names[1]
            });
        });
        // on success
        promise.then((rows) => {
            this.updateChart(names[0], names[1], rows);
            this.setBusy(false);
        });
        // on error
        promise.catch(ErrorAlertHandler.getInstance().errorAlert)
            .catch((error) => {
            console.error(error);
            this.setBusy(false);
        });
        return promise;
    }
}
//# sourceMappingURL=DummyDetailView.js.map