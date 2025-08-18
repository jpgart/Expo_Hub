import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function AIPage() {
  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Icons.brain className='h-6 w-6' />
            <h1 className='text-2xl font-bold tracking-tight'>AI Assistant</h1>
          </div>
        </div>

        <div className='grid gap-4'>
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Analytics</CardTitle>
              <CardDescription>
                Intelligent insights for export and import operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground flex h-64 items-center justify-center'>
                <div className='space-y-2 text-center'>
                  <Icons.brain className='mx-auto h-12 w-12' />
                  <p>AI features coming soon...</p>
                  <p className='text-sm'>
                    Advanced analytics and predictive insights for trade
                    operations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
