import React from 'react';
import { Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OrgLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
  showBorder?: boolean;
}

export const OrgLogo: React.FC<OrgLogoProps> = ({
  className = '',
  size = 'md',
  fallbackText = 'อบต.',
  showBorder = true,
}) => {
  const { orgSettings } = useApp();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-14 h-14 text-lg font-black',
    xl: 'w-20 h-20 text-2xl font-black',
  };

  if (orgSettings?.logoUrl) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${
          showBorder ? 'rounded-full border border-slate-200 shadow-xs bg-white' : ''
        } ${sizeClasses[size]} ${className}`}
      >
        <img
          src={orgSettings.logoUrl}
          alt={orgSettings.orgName || 'โลโก้ อบต.'}
          className="w-full h-full object-contain p-0.5"
          onError={(e) => {
            // If image fails to load, replace with fallback
            const target = e.target as HTMLElement;
            target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Default elegant emblem seal when no custom logo is uploaded
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full font-serif font-black select-none ${
        size === 'lg' || size === 'xl'
          ? 'bg-blue-50 text-blue-900 border-2 border-blue-800'
          : 'bg-blue-600 text-white shadow-xs'
      } ${sizeClasses[size]} ${className}`}
      title={orgSettings?.orgName || 'องค์การบริหารส่วนตำบล'}
    >
      <span>{fallbackText}</span>
    </div>
  );
};
