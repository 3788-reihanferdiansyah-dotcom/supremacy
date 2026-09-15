import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarDays, Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

type DatePickerProps = {
  date: string;
  onChange: (date: string) => void;
};

function fromIso(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIso(value?: Date) {
  return value ? format(value, 'yyyy-MM-dd') : '';
}

export function DateRangePicker({ date, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | undefined>();
  const appliedDate = fromIso(date);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setDraft(appliedDate);
    setOpen(nextOpen);
  }

  function applyDate() {
    if (!draft) return;
    onChange(toIso(draft));
    setOpen(false);
  }

  return (
    <div className="space-y-2" data-aime-component-name="div"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="5"  data-aime-line="45"  data-insp-path="src/components/DateRangePicker.tsx:45:5:div" >
      <p
        id="date-label"
        className="text-sm font-medium leading-none text-slate-100"
       data-aime-component-name="p"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="7"  data-aime-line="46"  data-insp-path="src/components/DateRangePicker.tsx:46:7:p" >
        Tanggal
      </p>
      <Popover open={open} onOpenChange={handleOpenChange} data-aime-component-name="Popover"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="7"  data-aime-line="52"  data-insp-path="src/components/DateRangePicker.tsx:52:7:Popover" >
        <PopoverTrigger asChild data-aime-component-name="PopoverTrigger"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="9"  data-aime-line="53"  data-insp-path="src/components/DateRangePicker.tsx:53:9:PopoverTrigger" >
          <button
            type="button"
            data-testid="date-trigger"
            aria-labelledby="date-label date-value"
            aria-expanded={open}
            aria-haspopup="dialog"
            className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-violet-400/50 bg-gradient-to-r from-violet-950 to-blue-950 px-4 py-3 text-left text-violet-50 shadow-sm outline-none transition hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
           data-aime-component-name="button"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="11"  data-aime-line="54"  data-insp-path="src/components/DateRangePicker.tsx:54:11:button" >
            <CalendarDays
              className="h-5 w-5 shrink-0 text-violet-300"
              aria-hidden="true"
             data-aime-component-name="CalendarDays"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="13"  data-aime-line="62"  data-insp-path="src/components/DateRangePicker.tsx:62:13:CalendarDays" />
            <span
              id="date-value"
              className="min-w-0 flex-1 font-semibold tracking-wide"
             data-aime-component-name="span"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="13"  data-aime-line="66"  data-insp-path="src/components/DateRangePicker.tsx:66:13:span" >
              {date || 'Pilih tanggal'}
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-violet-300 transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
             data-aime-component-name="ChevronDown"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="13"  data-aime-line="72"  data-insp-path="src/components/DateRangePicker.tsx:72:13:ChevronDown" />
          </button>
        </PopoverTrigger>
        {/* Radix Popover manages focus and dismissal while this role exposes the calendar panel to assistive technology. */}
        {/* biome-ignore lint/a11y/useSemanticElements: Radix Popover content cannot render as a native dialog. */}
        <PopoverContent
          role="dialog"
          aria-label="Pilih tanggal"
          align="start"
          side="bottom"
          sideOffset={8}
          avoidCollisions={false}
          className="pointer-events-auto z-50 max-h-96 w-72 overflow-y-auto overscroll-contain rounded-2xl border border-violet-500/50 bg-violet-950 p-0 text-violet-50 shadow-2xl sm:w-80"
          data-testid="date-popover"
         data-aime-component-name="PopoverContent"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="9"  data-aime-line="80"  data-insp-path="src/components/DateRangePicker.tsx:80:9:PopoverContent" >
          <div className="border-b border-violet-800 p-4 sm:p-5" data-aime-component-name="div"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="11"  data-aime-line="90"  data-insp-path="src/components/DateRangePicker.tsx:90:11:div" >
            <p className="text-sm font-medium text-violet-300" data-aime-component-name="p"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="13"  data-aime-line="91"  data-insp-path="src/components/DateRangePicker.tsx:91:13:p" >
              Pratinjau tanggal
            </p>
            <p className="mt-1 text-lg font-bold tracking-tight text-white sm:text-xl" data-aime-component-name="p"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="13"  data-aime-line="94"  data-insp-path="src/components/DateRangePicker.tsx:94:13:p" >
              {draft ? toIso(draft) : 'Pilih tanggal'}
            </p>
          </div>

          <div className="flex justify-center p-2 sm:p-4" data-aime-component-name="div"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="11"  data-aime-line="99"  data-insp-path="src/components/DateRangePicker.tsx:99:11:div" >
            <Calendar
              mode="single"
              selected={draft}
              onSelect={setDraft}
              defaultMonth={draft ?? new Date()}
              locale={id}
              weekStartsOn={1}
              showOutsideDays={false}
              className="rounded-xl bg-violet-950 text-violet-50"
              classNames={{
                month: 'space-y-4',
                caption_label: 'text-sm font-bold capitalize text-white',
                head_cell: 'w-8 rounded-md text-xs font-medium text-violet-200',
                nav_button:
                  'h-8 w-8 border border-violet-700 bg-violet-900 p-0 text-violet-100 opacity-100 hover:bg-violet-700 focus-visible:ring-2 focus-visible:ring-violet-300',
                cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
                day: 'h-8 w-8 rounded-md p-0 font-normal text-violet-50 hover:bg-violet-700 hover:text-white focus-visible:ring-2 focus-visible:ring-violet-300 aria-selected:opacity-100',
                day_selected:
                  'bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:from-violet-400 hover:to-blue-400 focus:from-violet-400 focus:to-blue-400',
                day_today:
                  'border border-violet-400 bg-violet-900 text-violet-100',
                day_outside: 'text-violet-300 opacity-60',
              }}
             data-aime-component-name="Calendar"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="13"  data-aime-line="100"  data-insp-path="src/components/DateRangePicker.tsx:100:13:Calendar" />
          </div>

          <div className="flex gap-3 border-t border-violet-800 p-4 sm:justify-end sm:p-5" data-aime-component-name="div"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="11"  data-aime-line="126"  data-insp-path="src/components/DateRangePicker.tsx:126:11:div" >
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-violet-700 bg-transparent text-violet-100 hover:bg-violet-900 hover:text-white focus-visible:ring-violet-300 sm:flex-none"
             data-aime-component-name="Button"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="13"  data-aime-line="127"  data-insp-path="src/components/DateRangePicker.tsx:127:13:Button" >
              <X className="mr-2 h-4 w-4" aria-hidden="true"  data-aime-component-name="X"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="15"  data-aime-line="133"  data-insp-path="src/components/DateRangePicker.tsx:133:15:X" />
              Batal
            </Button>
            <Button
              type="button"
              onClick={applyDate}
              disabled={!draft}
              className="flex-1 bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:from-violet-400 hover:to-blue-400 focus-visible:ring-violet-300 disabled:from-violet-950 disabled:to-blue-950 disabled:text-slate-300 sm:flex-none"
             data-aime-component-name="Button"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="13"  data-aime-line="136"  data-insp-path="src/components/DateRangePicker.tsx:136:13:Button" >
              <Check className="mr-2 h-4 w-4" aria-hidden="true"  data-aime-component-name="Check"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="15"  data-aime-line="142"  data-insp-path="src/components/DateRangePicker.tsx:142:15:Check" />
              Terapkan
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-slate-200" data-aime-component-name="p"  data-aime-path-name="src/components/DateRangePicker.tsx"  data-aime-column="7"  data-aime-line="148"  data-insp-path="src/components/DateRangePicker.tsx:148:7:p" >
        Pilih satu tanggal pada kalender.
      </p>
    </div>
  );
}
