import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, Component, ElementRef, HostBinding, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatCalendar, MatCalendarView, MatDatepickerContent } from '@angular/material/datepicker';
import { Moment } from 'moment';

import { CalendarHeaderComponent } from './calendar-header.component';
import { DatepickerModeService } from './datepicker-mode.service';
import { DatePickerMode } from './datepicker.model';

const mapMode = {
  'year-month': { view: 'multi-year'},
  'year-only': { view: 'multi-year'}
};

/** @ignore */
export const SELECTOR = 'gor-datepicker-content';

/**
 * Component responsible to display calendar and date list (in future).
 *
 * @link https://github.com/angular/components/blob/master/src/material/datepicker/calendar.ts
 */
@Component({
  selector: SELECTOR,
  templateUrl: './datepicker-content.component.html',
  styleUrls: ['./datepicker-content.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatepickerContentComponent<D> extends MatDatepickerContent<D> implements AfterViewInit {
  @ViewChild(MatCalendar, { static: false }) calendarRef: ElementRef<MatCalendar<D>>;

  @HostBinding('style.background-color') @Input() bgColor = 'white';

  /**
   * The text to main button of datepicker
   *
   * @default "Apply"
   */
  @Input() public applyText = 'Apply';

  /**
   * Datepicker mode change the component behavior
   * blocking which view modes will be used in calendar's
   * view transition
   *
   * @default "all"
   */
  private _mode: DatePickerMode = 'all';
  @Input() public set mode(mode: DatePickerMode) {
    this._mode = mode;
    if (!!mapMode[mode]) {
      this._startView = mapMode[mode].view;
    }
    this.modeService.setMode(mode);
  };
  public get mode(): DatePickerMode {
    return this._mode;
  }

  /**
   * An input indicating the type of the custom header component for the calendar, if set.
   *
   * @default CalendarHeaderComponent
   */
  @Input() public headerComponentRef: ComponentType<any> = CalendarHeaderComponent;

  /**
   * The maximum range date to be selected.
   */
  @Input() public maxDate: D;

  /**
   * The minimum range date to be selected.
   */
  @Input() public minDate: D;

  /**
   * The active day when datepicker is opened.
   */
  @Input() public startAt: D;

  /**
   * The active view when datepicker is opened.
   *
   * @default "month"
   * @see MatCalendarView
   */
  private _startView: MatCalendarView = 'month';
  @Input() public set startView(startView: MatCalendarView) {
    if (this.mode === 'all') {
      this._startView = startView;
    }
  };
  public get startView(): MatCalendarView {
    return this._startView;
  }

  @HostBinding('class') public hostClass = SELECTOR;

  constructor(
    elementRef: ElementRef,
    private modeService: DatepickerModeService
  ) {
    super(elementRef);
  }

  /**
   * The selected date stored for internal use.
   */
  public selectedDate: D | null = null;

  public canChangeView = (view: MatCalendarView, mode: DatePickerMode) => (
    mode === 'all' ||
    (mode === 'year-month' && view === 'year')
  )

  public ngAfterViewInit() {
    this._calendar._goToDateInView = (date: D, view: MatCalendarView) => {
      this._calendar.activeDate = date;
      if (!!this.canChangeView(view, this.mode)) {
        this._calendar.currentView = view;
      }
    };
    this._calendar.focusActiveCell();
  }

  /**
   * Function to be executed when some date is selected.
   *
   * @param newDate
   */
  public dateChanged(newDate: D | null) {
    if (this.mode === 'all') {
      this.setSelectedDate(newDate);
    }
  }

  public yearSelected = (year: Moment) => {
    if (this.mode === 'year-only') {
      return this.setSelectedDate(year);
    }
  }

  public monthSelected(month: Moment) {
    if (this.mode === 'year-month') {
      return this.setSelectedDate(month);
    }
  }

  private setSelectedDate(date) {
    this.selectedDate = date;
    if (this.datepicker) {
      this.datepicker.select(date);
    }
  }

}
