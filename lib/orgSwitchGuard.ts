// Set while the organization switcher is mid-switch (active org updated, URL
// not yet navigated) so the layout doesn't show its own "wrong org link"
// confirmation on top of the one the user just confirmed.
let switching = false;

export const setOrgSwitching = (value: boolean) => {
  switching = value;
};

export const isOrgSwitching = () => switching;
