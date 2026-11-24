import type { __Feature__ItemViewModel } from '../viewmodels/__feature-kebab__.viewmodel';

interface __Feature__CardProps {
    item: __Feature__ItemViewModel;
}

/** Pure presentational component: receives a view model, renders it. No state, no Redux. */
export function __Feature__Card({ item }: __Feature__CardProps) {
    return (
        <article className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="text-base font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm opacity-70">{item.descriptionText}</p>
            <time dateTime={item.createdAtIso} className="mt-2 block text-xs opacity-50">
                Created {item.createdAtLabel}
            </time>
        </article>
    );
}
