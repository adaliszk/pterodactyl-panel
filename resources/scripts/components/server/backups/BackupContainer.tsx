import React, { useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import getServerBackups from '@/api/server/backups/getServerBackups';
import useServer from '@/plugins/useServer';
import useFlash from '@/plugins/useFlash';
import { httpErrorToHuman } from '@/api/http';
import Can from '@/components/elements/Can';
import CreateBackupButton from '@/components/server/backups/CreateBackupButton';
import FlashMessageRender from '@/components/FlashMessageRender';
import BackupRow from '@/components/server/backups/BackupRow';
import { ServerContext } from '@/state/server';

export default () => {
    const { uuid } = useServer();
    const { addError, clearFlashes } = useFlash();
    const [ loading, setLoading ] = useState(true);

    const backups = ServerContext.useStoreState(state => state.backups.data);
    const setBackups = ServerContext.useStoreActions(actions => actions.backups.setBackups);

    useEffect(() => {
        clearFlashes('backups');
        getServerBackups(uuid)
            .then(data => setBackups(data.items))
            .catch(error => {
                console.error(error);
                addError({ key: 'backups', message: httpErrorToHuman(error) });
            })
            .then(() => setLoading(false));
    }, []);

    if (backups.length === 0 && loading) {
        return <Spinner size={'large'} centered={true}/>;
    }

    return (
        <div className={'mt-10 mb-6'}>
            <FlashMessageRender byKey={'backups'} className={'mb-4'}/>
            {!backups.length ?
                <p className="text-center text-sm text-neutral-400">
                    There are no backups stored for this server.
                </p>
                :
                <div>
                    {backups.map((backup, index) => <BackupRow
                        key={backup.uuid}
                        backup={backup}
                        className={index !== (backups.length - 1) ? 'mb-2' : undefined}
                    />)}
                </div>
            }
            <Can action={'backup.create'}>
                <div className={'mt-6 flex justify-end'}>
                    <CreateBackupButton/>
                </div>
            </Can>
        </div>
    );
};
